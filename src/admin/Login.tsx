import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { loginToEmail } from './helpers'
import { inputCls, labelCls, solidBtn } from './ui'

function authErrorRu(message: string) {
  const m = message.toLowerCase()
  if (m.includes('invalid login')) return 'Неверный логин или пароль'
  if (m.includes('email not confirmed')) return 'Аккаунт не подтверждён'
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Слишком много попыток — попробуй чуть позже'
  }
  if (m.includes('failed to fetch') || m.includes('network')) {
    return 'Нет соединения с сервером'
  }
  return message
}

export default function Login() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function signIn(e: FormEvent) {
    e.preventDefault()
    if (!login.trim() || !password) {
      setError('Введи логин и пароль')
      return
    }
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: loginToEmail(login),
      password,
    })
    setBusy(false)
    if (error) setError(authErrorRu(error.message))
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-sky-wash px-4 py-16">
      <form
        onSubmit={signIn}
        className="outline admin-pop w-full max-w-md rounded-[32px] bg-paper-white p-8 md:p-10"
      >
        <span className="outline inline-block rounded-full bg-lavender px-4 py-1.5 font-aeonik-pro text-xs font-bold uppercase tracking-[0.032em]">
          Админка
        </span>
        <h1 className="display mt-4" style={{ fontSize: 56, lineHeight: 0.9 }}>
          Вход
        </h1>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className={labelCls}>Логин</span>
            <input
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className={inputCls}
              autoFocus
            />
          </label>
          <label className="block">
            <span className={labelCls}>Пароль</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </label>

          {error && (
            <p role="alert" className="font-aeonik-pro text-sm font-bold text-ember">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className={`${solidBtn} w-full`}>
            {busy ? 'Входим…' : 'Войти'}
          </button>
        </div>

        <Link
          to="/"
          className="mt-6 inline-block font-aeonik-pro text-sm font-bold text-carbon/60 transition-colors hover:text-carbon"
        >
          ← На сайт
        </Link>
      </form>
    </section>
  )
}
