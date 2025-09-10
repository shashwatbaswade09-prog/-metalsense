import { useAppStore, type Role } from '@state/store'

export function RoleSelector() {
  const role = useAppStore(s => s.role)
  const setRole = useAppStore(s => s.setRole)

  return (
    <label aria-label="Select user role" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      Role
      <select value={role} onChange={e => setRole(e.target.value as Role)} aria-describedby="role-desc">
        <option value="citizen">Citizen</option>
        <option value="researcher">Researcher</option>
        <option value="industry">Industry/Regulator</option>
      </select>
      <span id="role-desc" className="sr-only">Choose your experience</span>
    </label>
  )
}

