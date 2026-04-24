export const mockAppData = {
  activity: [
    {
      amount: 'P 900',
      groupName: 'Beach Trip',
      id: 'act-1',
      text: 'Dinner added. You paid for 4 people.',
      type: 'expense' as const,
      when: 'Apr 21',
    },
    {
      amount: 'P 225',
      groupName: 'Beach Trip',
      id: 'act-2',
      text: 'Ana settled part of her balance.',
      type: 'settlement' as const,
      when: 'Apr 21',
    },
    {
      amount: 'P 600',
      groupName: 'Apartment',
      id: 'act-3',
      text: 'Groceries logged by Carlo.',
      type: 'expense' as const,
      when: 'Apr 18',
    },
  ],
  dashboard: {
    recentActivity: [
      {
        id: 'a1',
        text: 'Dinner added in Beach Trip. Lou now owed P 40.00 to You.',
        type: 'expense' as const,
      },
      {
        id: 'a2',
        text: 'Marked payment from Ana to you in Apartment.',
        type: 'settlement' as const,
      },
    ],
    groups: [
      {
        id: 'beach-trip',
        memberCount: 4,
        name: 'Beach Trip',
        netLabel: 'You are owed P 40.00',
        openBalanceCount: 2,
        topBalance: 'Lou owed P 40.00 to You',
        trend: 'positive' as const,
      },
      {
        id: 'apartment',
        memberCount: 3,
        name: 'Apartment',
        netLabel: 'You owed P 220.00',
        openBalanceCount: 2,
        topBalance: 'You owed P 220.00 to Carlo',
        trend: 'negative' as const,
      },
    ],
    summary: {
      attention: '2 groups need attention',
      net: 'You are owed P 530',
      openBalances: '4 open balances',
      owed: 'P 950',
      owes: 'P 420',
    },
    userName: 'Guest',
  },
  expenses: {
    dinner: {
      amount: 'P 900',
      breakdown: [
        { amount: 'P 225', member: 'You' },
        { amount: 'P 225', member: 'Ana' },
        { amount: 'P 225', member: 'Mark' },
        { amount: 'P 225', member: 'Lou' },
      ],
      date: 'Apr 21, 2026',
      groupId: 'beach-trip',
      paidBy: 'You paid full amount',
      participants: ['You', 'Ana', 'Mark', 'Lou'],
      result: [
        { id: 'r1', text: 'Ana owes you P 225' },
        { id: 'r2', text: 'Mark owes you P 225' },
        { id: 'r3', text: 'Lou owes you P 225' },
      ],
      title: 'Dinner',
    },
  },
  groups: {
    apartment: {
      balanceItems: ['You owed P 220.00 to Carlo', 'Mia owed P 80.00 to Carlo'],
      balanceSummary: 'Apartment expenses lean negative for you this month.',
      expenses: [
        {
          amount: 'P 600',
          dateLabel: 'Apr 18',
          expenseId: 'dinner',
          paidBy: 'Paid by Carlo',
          splitLabel: 'Split with 3 people',
          title: 'Groceries',
        },
      ],
      memberCount: 3,
      members: ['You', 'Carlo', 'Mia'],
      name: 'Apartment',
    },
    'beach-trip': {
      balanceItems: [
        'Ana owed P 80.00 to Mark',
        'Lou owed P 40.00 to You',
        'You owed P 0.00 to Ana',
      ],
      balanceSummary: 'This group is still open. One dinner and one van ride remain unsettled.',
      expenses: [
        {
          amount: 'P 900',
          dateLabel: 'Apr 21',
          expenseId: 'dinner',
          paidBy: 'Paid by You',
          splitLabel: 'Split with 4 people',
          title: 'Dinner',
        },
        {
          amount: 'P 450',
          dateLabel: 'Apr 20',
          expenseId: 'dinner',
          paidBy: 'Paid by Ana',
          splitLabel: 'Split with 4 people',
          title: 'Van ride',
        },
      ],
      memberCount: 4,
      members: ['You', 'Ana', 'Mark', 'Lou'],
      name: 'Beach Trip',
    },
  },
  settings: {
    currency: 'PHP',
    userName: 'Guest',
  },
}
