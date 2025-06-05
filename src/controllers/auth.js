import { registerUser, loginUser } from '../services/auth.js';

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