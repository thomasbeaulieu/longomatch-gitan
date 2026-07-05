export interface DefaultEventType {
  code: string
  label: string
  category: 'SHOT' | 'REBOUND' | 'PASS' | 'STEAL' | 'BLOCK' | 'TURNOVER' | 'FOUL'
  points: number
  isMade: 0 | 1 | null
  requiresShotLocation: 0 | 1
  color: string
  hotkey: string
}

export const DEFAULT_EVENT_TYPES: DefaultEventType[] = [
  { code: 'FG2_MADE', label: '2pts marqué', category: 'SHOT', points: 2, isMade: 1, requiresShotLocation: 1, color: '#2ecc71', hotkey: '2' },
  { code: 'FG2_MISS', label: '2pts manqué', category: 'SHOT', points: 0, isMade: 0, requiresShotLocation: 1, color: '#e74c3c', hotkey: 'q' },
  { code: 'FG3_MADE', label: '3pts marqué', category: 'SHOT', points: 3, isMade: 1, requiresShotLocation: 1, color: '#27ae60', hotkey: '3' },
  { code: 'FG3_MISS', label: '3pts manqué', category: 'SHOT', points: 0, isMade: 0, requiresShotLocation: 1, color: '#c0392b', hotkey: 'w' },
  { code: 'FT_MADE', label: 'LF marqué', category: 'SHOT', points: 1, isMade: 1, requiresShotLocation: 0, color: '#58d68d', hotkey: 'f' },
  { code: 'FT_MISS', label: 'LF manqué', category: 'SHOT', points: 0, isMade: 0, requiresShotLocation: 0, color: '#cd6155', hotkey: 'g' },
  { code: 'REB_OFF', label: 'Rebond off.', category: 'REBOUND', points: 0, isMade: null, requiresShotLocation: 0, color: '#3498db', hotkey: 'o' },
  { code: 'REB_DEF', label: 'Rebond déf.', category: 'REBOUND', points: 0, isMade: null, requiresShotLocation: 0, color: '#2980b9', hotkey: 'd' },
  { code: 'AST', label: 'Passe déc.', category: 'PASS', points: 0, isMade: null, requiresShotLocation: 0, color: '#f39c12', hotkey: 'a' },
  { code: 'STL', label: 'Interception', category: 'STEAL', points: 0, isMade: null, requiresShotLocation: 0, color: '#9b59b6', hotkey: 's' },
  { code: 'BLK', label: 'Contre', category: 'BLOCK', points: 0, isMade: null, requiresShotLocation: 0, color: '#8e44ad', hotkey: 'b' },
  { code: 'TOV', label: 'Perte de balle', category: 'TURNOVER', points: 0, isMade: null, requiresShotLocation: 0, color: '#7f8c8d', hotkey: 't' },
  { code: 'FOUL', label: 'Faute', category: 'FOUL', points: 0, isMade: null, requiresShotLocation: 0, color: '#34495e', hotkey: 'x' }
]
