import { appDb, type AuthProvider } from '@/lib/db/app-db'
import { buildOutboxRecord, buildSystemActivity, ensureAppInitialized, getSettingsRecord } from '@/lib/repositories/mock-app-repository/core'
import { updateGroupRecord } from '@/lib/repositories/mock-app-repository/balances'

export async function updateAuthState({
  accountEmail,
  authProvider,
  isSignedIn,
}: {
  accountEmail: string | null
  authProvider: AuthProvider
  isSignedIn: boolean
}) {
  const settings = await getSettingsRecord()
  const nextSettings = { ...settings, accountEmail, authProvider, isSignedIn, updatedAt: Date.now() }

  await appDb.transaction('rw', [appDb.settings, appDb.syncOutbox], async () => {
    await appDb.settings.put(nextSettings)
    await appDb.syncOutbox.add(buildOutboxRecord({ entityId: nextSettings.id, entityType: 'settings', operation: 'update', payload: JSON.stringify(nextSettings) }))
  })
}

export async function updateCurrency({ currency }: { currency: string }) {
  const settings = await getSettingsRecord()
  const nextCurrency = currency.trim().toUpperCase()
  if (nextCurrency.length === 0) {
    throw new Error('Currency is required.')
  }

  const nextSettings = { ...settings, currency: nextCurrency, updatedAt: Date.now() }
  await appDb.transaction('rw', [appDb.settings, appDb.syncOutbox], async () => {
    await appDb.settings.put(nextSettings)
    await appDb.syncOutbox.add(buildOutboxRecord({ entityId: nextSettings.id, entityType: 'settings', operation: 'update', payload: JSON.stringify(nextSettings) }))
  })
}

export async function setGroupActiveState({ groupId, isActive }: { groupId: string; isActive: boolean }) {
  const nextGroup = await updateGroupRecord(groupId, (group) => ({ ...group, isActive, updatedAt: Date.now() }))
  await appDb.activity.add(buildSystemActivity({ groupId, message: isActive ? 'Group marked active.' : 'Group marked inactive.', relatedId: nextGroup.id }))
  return nextGroup
}

export async function setGroupDoneState({ groupId, isDone }: { groupId: string; isDone: boolean }) {
  const nextGroup = await updateGroupRecord(groupId, (group) => ({ ...group, isActive: isDone ? false : group.isActive, isDone, updatedAt: Date.now() }))
  await appDb.activity.add(buildSystemActivity({ groupId, message: isDone ? 'Group marked done.' : 'Group reopened.', relatedId: nextGroup.id }))
  return nextGroup
}

export async function updateProfile({
  accountEmail,
  userName,
}: {
  accountEmail: string | null
  userName: string
}) {
  const settings = await getSettingsRecord()
  const nextUserName = userName.trim()
  if (nextUserName.length === 0) {
    throw new Error('User name is required.')
  }

  const nextSettings = {
    ...settings,
    accountEmail: settings.authProvider === 'google' ? settings.accountEmail : (accountEmail?.trim() || null),
    updatedAt: Date.now(),
    userName: nextUserName,
  }
  await appDb.transaction('rw', [appDb.members, appDb.settings, appDb.syncOutbox], async () => {
    const currentUser = await appDb.members.get(settings.currentUserMemberId)
    if (currentUser) {
      await appDb.members.put({
        ...currentUser,
        email: settings.authProvider === 'google' ? currentUser.email : (accountEmail?.trim().toLowerCase() || null),
        name: nextUserName,
        updatedAt: nextSettings.updatedAt,
      })
    }

    await appDb.settings.put(nextSettings)
    await appDb.syncOutbox.add(buildOutboxRecord({ entityId: nextSettings.id, entityType: 'settings', operation: 'update', payload: JSON.stringify(nextSettings) }))
  })
}

export async function resetLocalData() {
  await appDb.transaction('rw', [appDb.activity, appDb.budgets, appDb.expenseShares, appDb.expenses, appDb.groupMembers, appDb.groups, appDb.members, appDb.settings, appDb.settlements, appDb.syncOutbox], async () => {
    await Promise.all([
      appDb.activity.clear(),
      appDb.budgets.clear(),
      appDb.expenseShares.clear(),
      appDb.expenses.clear(),
      appDb.groupMembers.clear(),
      appDb.groups.clear(),
      appDb.members.clear(),
      appDb.settings.clear(),
      appDb.settlements.clear(),
      appDb.syncOutbox.clear(),
    ])
  })

  await ensureAppInitialized()
}
