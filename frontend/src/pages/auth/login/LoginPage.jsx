import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AtSign, Lock, Eye, EyeOff, Compass, MapPin, Camera, Globe, Mountain, Plane } from 'lucide-react';

import SignInIllustration from '../../../assets/illustrations/sign-in-illustration.svg';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const queryClient = useQueryClient();

  const {
    mutate: loginMutation,
    isError,
    isPending,
    error,
  } = useMutation({
    mutationFn: async ({ username, password }) => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to login');
        console.log(data);
        return data;
      } catch (error) {
        console.log(error);
        throw new Error(error.message || 'Something went wrong!');
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation(formData);
  };

  return (
       <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center px-4 py-8'>
      <div className='bg-white rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm flex max-w-5xl w-full overflow-hidden relative'>
        {/* Floating travel elements */}
        <div className='absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-60 animate-pulse'></div>
        <div className='absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full opacity-40 animate-bounce'></div>
        <div className='absolute top-1/4 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-50 animate-ping'></div>
        
        {/* Left Panel */}
        <div className='w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white p-12 hidden lg:flex flex-col justify-between relative overflow-hidden'>
          {/* Animated background elements */}
          <div className='absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-5 rounded-full -translate-y-32 translate-x-32 animate-pulse'></div>
          <div className='absolute top-1/3 left-0 w-48 h-48 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-15 rounded-full -translate-x-24 animate-bounce'></div>
          <div className='absolute bottom-1/4 right-1/4 w-32 h-32 bg-blue-400 bg-opacity-10 rounded-full translate-y-16 animate-pulse'></div>
          <div className='absolute top-1/2 right-0 w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 opacity-20 rounded-full translate-x-10 animate-bounce'></div>
          
          <div className='relative z-10'>
            <div className='flex items-center gap-4 mb-8'>
              <div className='p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm'>
                <Compass size={32} className='text-white' />
              </div>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent'>
                GoJourneys
              </h1>
            </div>
            
            <h2 className='text-4xl font-bold mb-6 leading-tight'>
              Chào mừng trở lại!
            </h2>
            <p className='text-xl text-emerald-100 mb-10 leading-relaxed'>
              Tiếp tục hành trình khám phá thế giới cùng chúng tôi
            </p>
            
            {/* Travel-themed features */}
            <div className='space-y-6'>
              <div className='flex items-center gap-4 text-emerald-100 group hover:text-white transition-colors duration-300'>
                <div className='p-2 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform duration-300'>
                  <MapPin size={22} />
                </div>
                <span className='text-lg'>Chia sẻ địa điểm tuyệt vời</span>
              </div>
              <div className='flex items-center gap-4 text-emerald-100 group hover:text-white transition-colors duration-300'>
                <div className='p-2 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform duration-300'>
                  <Camera size={22} />
                </div>
                <span className='text-lg'>Lưu giữ kỷ niệm đẹp</span>
              </div>
              <div className='flex items-center gap-4 text-emerald-100 group hover:text-white transition-colors duration-300'>
                <div className='p-2 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform duration-300'>
                  <Globe size={22} />
                </div>
                <span className='text-lg'>Kết nối cộng đồng du lịch</span>
              </div>
              <div className='flex items-center gap-4 text-emerald-100 group hover:text-white transition-colors duration-300'>
                <div className='p-2 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform duration-300'>
                  <Mountain size={22} />
                </div>
                <span className='text-lg'>Khám phá điều mới mẻ</span>
              </div>
            </div>
          </div>
          
          {/* Travel illustration area */}
          <div className='relative z-10 flex justify-center items-end'>
            <div className='relative'>
              <div className='w-80 h-60 bg-gradient-to-t from-white/10 to-white/5 rounded-3xl backdrop-blur-sm border border-white/20 flex items-center justify-center relative overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent'></div>
                
                {/* Travel icons scattered */}
                <div className='relative z-10 flex items-center justify-center'>
                  <Plane size={60} className='text-white/80' />
                </div>
                
                <div className='absolute top-6 right-6 w-4 h-4 bg-yellow-400 rounded-full animate-ping'></div>
                <div className='absolute bottom-8 left-8 w-3 h-3 bg-orange-400 rounded-full animate-pulse'></div>
                <div className='absolute top-1/2 left-6 w-2 h-2 bg-pink-400 rounded-full animate-bounce'></div>
                <div className='absolute bottom-6 right-1/3 w-3 h-3 bg-blue-400 rounded-full animate-pulse'></div>
                
                {/* Small travel icons */}
                <MapPin size={24} className='absolute top-8 left-1/3 text-white/60 animate-bounce' />
                <Camera size={20} className='absolute bottom-12 right-8 text-white/60 animate-pulse' />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className='w-full lg:w-1/2 p-8 sm:p-16 bg-white relative'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-3xl'></div>
          
          <div className='relative z-10'>
            <div className='mb-10'>
              <h2 className='text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-700 to-teal-600 bg-clip-text text-transparent mb-3'>
                Đăng nhập
              </h2>
              <p className='text-gray-600 text-lg'>
                Chào mừng trở lại GoJourneys! ✈️
              </p>
            </div>
            
            <div className='flex flex-col gap-8'>
              {/* Username Field */}
              <div className='space-y-3'>
                <label className='text-sm font-semibold text-gray-800 uppercase tracking-wide'>
                  Tên đăng nhập
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <AtSign size={22} className='text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200' />
                  </div>
                  <input
                    type='text'
                    name='username'
                    placeholder='Nhập tên đăng nhập của bạn'
                    className='w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 text-lg'
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className='space-y-3'>
                <label className='text-sm font-semibold text-gray-800 uppercase tracking-wide'>
                  Mật khẩu
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <Lock size={22} className='text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200' />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    placeholder='Nhập mật khẩu của bạn'
                    className='w-full pl-12 pr-14 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 text-lg'
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-emerald-600 transition-colors duration-200'
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type='button'
                className='w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 focus:ring-4 focus:ring-emerald-200 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-lg'
                disabled={isPending}
                onClick={handleSubmit}
              >
                {isPending ? (
                  <div className='flex items-center justify-center gap-3'>
                    <div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  <div className='flex items-center justify-center gap-2'>
                    <span>Bắt đầu hành trình</span>
                    <Plane size={20} />
                  </div>
                )}
              </button>
              
              {isError && (
                <div className='bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl relative overflow-hidden'>
                  <div className='absolute inset-0 bg-gradient-to-r from-red-100 to-pink-100 opacity-50'></div>
                  <div className='relative z-10 font-medium'>{error.message}</div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className='my-10 flex items-center'>
              <div className='flex-1 border-t-2 border-gray-200'></div>
              <span className='px-6 text-sm font-semibold text-gray-500 bg-white uppercase tracking-wide'>hoặc</span>
              <div className='flex-1 border-t-2 border-gray-200'></div>
            </div>

            {/* Social Login */}
            <div className='space-y-4 mb-10'>
              <button className='w-full flex items-center justify-center gap-4 py-4 px-6 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:bg-white hover:border-emerald-300 hover:shadow-lg transform hover:scale-[1.01] transition-all duration-200 group'>
                <div className='w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center'>
                  <div className='w-3 h-3 bg-white rounded-sm'></div>
                </div>
                <span className='font-semibold text-gray-700 group-hover:text-emerald-600 text-lg'>Tiếp tục với Google</span>
              </button>
              <button className='w-full flex items-center justify-center gap-4 py-4 px-6 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:bg-white hover:border-emerald-300 hover:shadow-lg transform hover:scale-[1.01] transition-all duration-200 group'>
                <div className='w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center'>
                  <div className='w-3 h-3 bg-white rounded-sm'></div>
                </div>
                <span className='font-semibold text-gray-700 group-hover:text-emerald-600 text-lg'>Tiếp tục với Facebook</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className='text-center space-y-4'>
              <p className='text-gray-600 text-lg font-medium'>
                Chưa có tài khoản? 🗺️
              </p>
              <Link to='/SignUp' className='block w-full'>
    <button
      type='button'
      className='w-full py-4 px-8 bg-white border-3 border-emerald-600 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-600 hover:text-white hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-lg'
    >
      <div className='flex items-center justify-center gap-2'>
        <span>Tham gia GoJourneys</span>
        <Compass size={20} />
      </div>
    </button>
  </Link>
              
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
