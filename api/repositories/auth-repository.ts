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
    try {
      return await AuthService.authControllerVerifyEmail({
        token,
      });
    } catch (error) {
      console.log('Verify email error:', error);
      throw error;
    }
  }

  public async resendVerificationEmail(email: string) {
    try {
      return await AuthService.authControllerSendVerificationEmail({
        email,
      });
    } catch (error) {
      console.log('Resend verification email error:', error);
      throw error;
    }
  }

  public async loginUser(email: string, password: string) {
    try {
      return await AuthService.authControllerLogin({
        email,
        password,
      });
    } catch (error) {
      console.log('Login error:', error);
      throw error;
    }
  }

  public async getProfile() {
    try {
      return await AuthService.authControllerGetProfile();
    } catch (error) {
      console.log('Get profile error:', error);
      throw error;
    }
  }

  public async updateProfile() {
    try {
      return await AuthService.authControllerUpdateProfile();
    } catch (error) {
      console.log('Update profile error:', error);
      throw error;
    }
  }

  public async logoutUser(refreshToken: string, userId: string) {
    try {
      return await AuthService.authControllerLogout({
        refreshToken,
        userId,
      });
    } catch (error) {
      console.log('Logout error:', error);
      throw error;
    }
  }

  public async resetPasswordEmail(email: string) {
    try {
      return await AuthService.authControllerResetPasswordEmail({
        email,
      });
    } catch (error) {
      console.log('Reset password email error:', error);
      throw error;
    }
  }

  public async resetPassword(email: string, newPassword: string) {
    try {
      return await AuthService.authControllerResetPassword({
        email,
        newPassword,
      });
    } catch (error) {
      console.log('Reset password error:', error);
      throw error;
    }
  }
}
