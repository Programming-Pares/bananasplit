import { cn } from '@/lib/utils'

export function QrInvitePreview() {
  const qrRows = [
    '111011001',
    '100010101',
    '101110111',
    '001001000',
    '111011101',
    '100000001',
    '101111101',
    '100010001',
    '111011111',
  ]

  return (
    <div className="grid grid-cols-9 gap-1 rounded-[28px] bg-white p-4 shadow-[0_16px_32px_rgba(63,52,25,0.12)]">
      {qrRows.flatMap((row, rowIndex) =>
        row.split('').map((cell, cellIndex) => (
          <span
            key={`${rowIndex}-${cellIndex}`}
            className={cn(
              'aspect-square rounded-[4px]',
              cell === '1' ? 'bg-foreground' : 'bg-[#fff6d6]',
            )}
          />
        )),
      )}
    </div>
  )
}
