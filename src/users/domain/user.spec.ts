import { User } from './user'

describe('User', () => {
  it('should create a new user', () => {
    const user = User.create({
      email: 'test@example.com',
      password: 'hashed-password',
      displayName: 'Test User',
    })
    expect(user).toBeDefined()
    expect(user.id).toMatch(/^usr-/)
    expect(user.email).toBe('test@example.com')
    expect(user.displayName).toBe('Test User')
  })

  it('should update the display name of the user', () => {
    const user = User.create({
      email: 'test@example.com',
      password: 'hashed-password',
      displayName: 'Test User',
    })
    user.updateDisplayName('New Name')
    expect(user.displayName).toBe('New Name')
  })

  it('should not clear the display name when passed an empty value', () => {
    const user = User.create({
      email: 'test@example.com',
      password: 'hashed-password',
      displayName: 'Test User',
    })
    user.updateDisplayName('')
    expect(user.displayName).toBe('Test User')
  })

  it('should hash and verify the password', async () => {
    const user = User.create({
      email: 'test@example.com',
      password: '',
      displayName: 'Test User',
    })
    await user.setPassword('correct-password')
    expect(user.password).not.toBe('correct-password')
    expect(await user.comparePassword('correct-password')).toBe(true)
    expect(await user.comparePassword('wrong-password')).toBe(false)
  })
})
