export interface DefaultRosterPlayer {
  firstName: string
  lastName: string
  position: string
}

export const DEFAULT_ROSTER: DefaultRosterPlayer[] = [
  { firstName: 'Théo', lastName: 'Foucher', position: 'PG' },
  { firstName: 'Louis', lastName: 'Le Carrer', position: 'SF' },
  { firstName: 'Romain', lastName: 'Grégoire', position: 'PF' },
  { firstName: 'Gaël', lastName: 'Gélu', position: 'PG' },
  { firstName: 'Sandro', lastName: 'Perazza', position: 'PG' },
  { firstName: 'Michel', lastName: 'Nsimba', position: 'PF' },
  { firstName: 'Alexis', lastName: 'Racine', position: 'SG' },
  { firstName: 'Emryss', lastName: 'Mormin', position: 'PF' },
  { firstName: 'Antoine', lastName: 'Belkessa', position: 'PG' }
]
