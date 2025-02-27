/* eslint-disable prettier/prettier */
import type { FC } from "react"
import { useState, useEffect } from "react"

import type { ActionFunction, LoaderFunction } from "remix"
import {
  json,
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
} from "remix"

import invariant from "tiny-invariant"

import { getUserById, updateUserById } from "~/models/user.server"
import { requireUserId } from "~/session.server"
import {
  ProfileFormInputFrame,
  ProfileFormPlaceholder,
  ProfileFormInputText,
  ProfileFormCancelBtn,
  ProfileFormSubmitBtn,
  ProRoundedRectangle,
  ProfileAvatarEdit,
  ProfileAvatarImgEdit,
  ProAvatarInput,
} from "~/styles/styledComponents"
import SvgBackButton from "~/styles/SVGR/SvgBackButton"
import SvgDefaultAvatar from "~/styles/SVGR/SvgDefaultAvatar"
import SvgPencil from "~/styles/SVGR/SvgPencil"
import { join, MAX_FORM_LENGTH } from "~/utils"

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>

const getLoaderData = async (request: Request) => {
  const userId = await requireUserId(request)
  const user = await getUserById(userId)
  return { user: user }
}

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>(await getLoaderData(request))
}

type ActionData =
  | {
    userId: string | null
    email: string | null
    userName: string | null
  }
  | undefined



export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const user = await getUserById(userId)
  const existingEmail = user?.email
  const existingUserName = user?.userName
  const existingAvatar = user?.avatarUrl
  const formData = await request.formData()
  const formUserId = formData.get(`userId`)

  const formEmail = formData.get(`email`)

  const formUserName = formData.get(`userName`)
  const formAvatarUrl = formData.get(`avatarURL`)
  const finalEmail = formEmail === `` ? existingEmail : formEmail
  const finalUserName = formUserName === `` ? existingUserName : formUserName
  const finalAvatar = formAvatarUrl === `` ? existingAvatar : formAvatarUrl?.toString()



  invariant(typeof formUserId === `string`, `userId must be a string`)
  invariant(typeof finalEmail === `string`, `email must be a string`)
  invariant(typeof finalUserName === `string`, `username must be a string`)
  invariant(typeof finalAvatar === `string`, `url must be a string`)


  await updateUserById(formUserId, finalEmail, finalUserName, finalAvatar)

  return redirect(`/profile`)
}

const Edit: FC = () => {
  const errors = useActionData()
  const navigate = useNavigate()
  const data = useLoaderData()
  const user = data?.user
  const userId = user.id
  const avatar = user?.avatarUrl ? (
    user?.avatarUrl
  ) : (
    <SvgDefaultAvatar />)
  const avatarShort = user?.avatarUrl ? (
    (avatar).slice(0, 28)
  ) : (
    `Avatar not set`)


  const [avatarInput, setAvatarInput] = useState(false)
  const [avatarValue, setAvatarValue] = useState(true)

  const showAvatarInput = () => {
    setAvatarInput(true)
    setAvatarValue(false)
  }

  const centered = [`flex`, `items-center`, `place-content-center`, `flex-col`]

  return (
    <div className={join(...centered)}>

      <div className={join(`grid`, `grid-cols-3`, `justify-center`, `align-middle`, `w-full`, `pb-20`, `mt-2`, `content-center`)}>
        <button
          className={join(`pt-2`, `flex`, `justify-end`, `hover:pointer-events-auto`)}
          onClick={() => navigate(`/profile`)}
        >
          <SvgBackButton />
        </button>
        <div className={join(`px-50`, `flex`, `justify-center`, `text-xs`, `items-center`, `text-[#E4EDDF]`)}>
          Settings
        </div>
      </div>



      <Form method="post">
        <input type="hidden" name="userId" value={userId} />
        <div>

          <div className={join(`flex`, `justify-center`, `flex-col`, `align-middle`, `ml-4`)}>
            <ProRoundedRectangle className={join(`items-center`, `grid grid-cols-4`, `justify-between`)}>

              <ProfileAvatarEdit
                className={join(`flex`, `items-center`, `place-content-center`, `col-start-1`, `col-span-1`, `w-fit`)}
              >
                {typeof avatar === `string` ? (
                  <ProfileAvatarImgEdit src={avatar} />
                ) : (
                  avatar
                )}
              </ProfileAvatarEdit>

              <div className={join(`flex-col`, `col-start-2`, `col-span-2`, `w-3/5`, `pl-2`, `pr-2`, `mr-3`)}>
                <div className={join(`mt-30`)}>
                  <ProfileFormPlaceholder>Photo URL</ProfileFormPlaceholder>
                </div>

                {
                  avatarValue && (

                    <div className={join(`mt-30`)}>
                      <p className={join(`text-white/100`, `text-xs`)}>
                        {avatarShort}
                      </p>
                    </div>
                  )
                }


                {avatarInput && (
                  <div className={join(`-mt-1`, `flex`)}>
                    <ProAvatarInput type="url" name="avatarURL" className={join(`mt-2`, `pr-2`)} />
                  </div>
                )}

              </div>


              <div onClick={showAvatarInput} className={join(`hover:cursor-pointer`)}>
                <SvgPencil />
              </div>


            </ProRoundedRectangle>
            <ProfileFormInputFrame>

              <div className={join(`mt-30`)}>

                <ProfileFormPlaceholder>Email</ProfileFormPlaceholder>
              </div>

              <div className={join(`-mt-1`)}>

                <ProfileFormInputText type="email" name="email" className={join(`items-center`)} />
              </div>
            </ProfileFormInputFrame>

            {errors?.email ? (
              <em className="text-red-600">{errors.email}</em>
            ) : null}
            <ProfileFormInputFrame>

              <div className={join(`mt-30`)}>

                <ProfileFormPlaceholder>Username</ProfileFormPlaceholder>
              </div>

              <div className={join(`-mt-1`)}>

                <ProfileFormInputText maxLength={MAX_FORM_LENGTH} type="userName" name="userName" className={join(`items-center`)} />
              </div>

            </ProfileFormInputFrame>
            {errors?.userName ? (
              <em className="text-red-600">{errors.userName}</em>
            ) : null}



          </div>


        </div>


        <div className={join(`flex`, `flex-row`, `w-276`, `absolute`, `left-0`, `bottom-3`, `h-16`, `w-full`, `place-content-center`)}>

          <ProfileFormCancelBtn className={join(`flex`, `items-center`, `text-xs`, `place-content-center`)}
           type="button"
            onClick={() => navigate(`/profile`)}>
            Cancel
          </ProfileFormCancelBtn>


          <ProfileFormSubmitBtn className={join(`flex`, `items-center`, `text-xs`, `place-content-center`)} type="submit">
            Update Profile
          </ProfileFormSubmitBtn>
        </div>
      </Form >




    </div >
  )
}

export default Edit