import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos, error } = await supabase.from('todos').select('*')
  console.log('error:', error)

console.log({ error, todos })

  return (
    <ul>
      {error && <div>查询出错: {error.message}</div>}
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
      <div>{JSON.stringify(todos)}</div>
    </ul>
  )
}
