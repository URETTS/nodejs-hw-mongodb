import { registerUser, loginUser ,refreshSession, logoutUser  } from '../services/auth.js';

export const handleRegister = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
};

export const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  const { accessToken } = await loginUser(email, password, res);

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken,
    },
  });
};

export const handleRefresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const { accessToken } = await refreshSession(refreshToken);

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken,
    },
  });
};

export const handleLogout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  await logoutUser(refreshToken);
  res.status(204).end();
};