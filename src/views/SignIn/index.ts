import Validation from 'components/Form/Validation'
import AuthLayout from 'layouts/Auth/index'
import SignUpView from 'views/SignUp'

export default class SignInView {
  static pathname = '/'

  constructor() {
    return new AuthLayout('signIn', {
      title: 'Войти',
      fields: [
        {
          label: 'Логин',
          input: {
            name: 'login',
            type: 'text',
            validation: Validation.rules.login,
          },
        },
        {
          label: 'Пароль',
          input: {
            name: 'pasword',
            type: 'password',
            validation: Validation.rules.password,
          },
        },
      ],
      submitButtonText: 'Вход',
      authLink: {
        href: SignUpView.pathname,
        isRoute: true,
        children: ['Нет аккаунта?'],
      },
    })
  }
}
