import { AuthService } from '../generated/services/AuthService';

export default class AuthRepository {
  public async registerUser(email: string, password: string) {
    try {
      const result = await AuthService.authControllerRegister({
        email,
        password,
      });
      return result;
    } catch (error) {
      console.log('Registration error:', error);
      throw error;
    }
  }

  public async verifyEmail(token: string) {
    return await AuthService.authControllerVerifyEmail({
      token,
    });
  }

  public async resendVerificationEmail(email: string) {
    return await AuthService.authControllerSendVerificationEmail({
      email,
    });
  }

  public async loginUser(email: string, password: string) {
    return await AuthService.authControllerLogin({
      email,
      password,
    });
  }

  public async getProfile() {
    return await AuthService.authControllerGetProfile();
  }

  public async updateProfile() {
    return await AuthService.authControllerUpdateProfile();
  }

  public async logoutUser(refreshToken: string, userId: string) {
    return await AuthService.authControllerLogout({
      refreshToken,
      userId,
    });
  }

  public async resetPasswordEmail(email: string) {
    return await AuthService.authControllerResetPasswordEmail({
      email,
    });
  }

  public async resetPassword(email: string, newPassword: string) {
    return await AuthService.authControllerResetPassword({
      email,
      newPassword,
    });
  }
}
