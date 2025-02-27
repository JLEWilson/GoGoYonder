import type { FC } from "react"
import { useEffect, useRef } from "react"

import type { ActionFunction, LoaderFunction, MetaFunction } from "remix"
import {
  Form,
  json,
  Link,
  useActionData,
  redirect,
  useSearchParams,
} from "remix"

import { verifyLogin } from "~/models/user.server"
import { createUserSession, getUserId } from "~/session.server"
import { MainBtn } from "~/styles/styledComponents"
import { join, validateEmail } from "~/utils"

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request)
  if (userId) return redirect(`/home`)
  return json({})
}

interface ActionData {
  errors?: {
    email?: string
    password?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const email = formData.get(`email`)
  const password = formData.get(`password`)
  const redirectTo = formData.get(`redirectTo`)
  const remember = formData.get(`remember`)

  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: `Email is invalid` } },
      { status: 400 },
    )
  }

  if (typeof password !== `string`) {
    return json<ActionData>(
      { errors: { password: `Password is required` } },
      { status: 400 },
    )
  }

  if (password.length < 8) {
    return json<ActionData>(
      { errors: { password: `Password is too short` } },
      { status: 400 },
    )
  }

  const user = await verifyLogin(email, password)

  if (!user) {
    return json<ActionData>(
      { errors: { email: `Invalid email or password` } },
      { status: 400 },
    )
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === `on` ? true : false,
    redirectTo: typeof redirectTo === `string` ? redirectTo : `/home`,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: `Login`,
  }
}

const LoginPage: FC = () => {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get(`redirectTo`) || `/home`
  const actionData = useActionData() as ActionData
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus()
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus()
    }
  }, [actionData])

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.email && (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.password && (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <MainBtn type="submit">Log in</MainBtn>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
            <div className="text-center text-sm text-gray-500">
              Don’t have an account?{` `}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: `/join`,
                  search: searchParams.toString(),
                }}
              >
                Sign up
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default LoginPage
