import { AuthApi } from 'api/index'
import ProfileApi, { ProfileChangePasswordRequestParamsType } from 'api/Profile'
import { Router, routes } from 'router/index'
import { store } from 'services/index'
import { UserType } from 'types/user'

const profileApi = new ProfileApi()
const authApi = new AuthApi()

export default class ChatController {
  public async changeAvatar(avatar: File) {
    try {
      const formData = new FormData()

      formData.append('avatar', avatar)

      const response = await profileApi.changeAvatar(formData)

      store.set('user', response)

      return response
    } catch (error) {
      if (error instanceof XMLHttpRequest) {
        const response = JSON.parse(error.response)

        store.set('error', {
          status: error.status,
          message: response.reason || response.message,
        })
      }

      Router.navigate(routes.error.pathname)

      return error
    }
  }

  public async changeProfile(user: UserType) {
    try {
      const response = await profileApi.change(user)

      store.set('user', response)

      return response
    } catch (error) {
      if (error instanceof XMLHttpRequest) {
        const response = JSON.parse(error.response)

        store.set('error', {
          status: error.status,
          message: response.reason || response.message,
        })
      }

      Router.navigate(routes.error.pathname)

      return error
    }
  }

  public async changePassword(form: ProfileChangePasswordRequestParamsType) {
    try {
      const response = await profileApi.changePassword(form)

      return response
    } catch (error) {
      if (error instanceof XMLHttpRequest) {
        const response = JSON.parse(error.response)

        store.set('error', {
          status: error.status,
          message: response.reason || response.message,
        })
      }

      Router.navigate(routes.error.pathname)

      return error
    }
  }

  public async logout() {
    return await authApi.logout()
  }
}