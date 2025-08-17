import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Mail, User, Lock, AtSign, Eye, EyeOff, Globe, Camera, Mountain, Plane, Compass, MapPin } from 'lucide-react';

import SignUpIllustration from '../../../assets/illustrations/sign-up-illustration.svg';

const SignUpPage = () => {
  const navigate = useNavigate(); // Khởi tạo navigate
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const {
    mutate: signupMutation,
    isError,
    isPending,
    error,
  } = useMutation({
    mutationFn: async ({ email, username, fullName, password }) => {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, username, fullName, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create account');
        console.log(data);
        return data;
      } catch (error) {
        console.error(error);
        throw new Error(error.message || 'Something went wrong!');
      }
    },

    onSuccess: () => {
      toast.success('Account created successfully');
      setFormData({
        email: '',
        username: '',
        fullName: '',
        password: '',
      });
      setShowPassword(false);
      navigate('/login'); // Chuyển hướng sang trang đăng nhập
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    signupMutation(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center px-4 py-4'>
      <div className='bg-white rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm flex max-w-5xl w-full overflow-hidden relative'>
        {/* Floating travel elements */}
        <div className='absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-60 animate-pulse'></div>
        <div className='absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full opacity-40 animate-bounce'></div>
        <div className='absolute top-1/4 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-50 animate-ping'></div>
        
        {/* Left Panel */}
        <div className='w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white p-8 hidden lg:flex flex-col justify-between relative overflow-hidden'>
          {/* Animated background elements */}
          <div className='absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-5 rounded-full -translate-y-32 translate-x-32 animate-pulse'></div>
          <div className='absolute top-1/3 left-0 w-48 h-48 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-15 rounded-full -translate-x-24 animate-bounce'></div>
          <div className='absolute bottom-1/4 right-1/4 w-32 h-32 bg-blue-400 bg-opacity-10 rounded-full translate-y-16 animate-pulse'></div>
          <div className='absolute top-1/2 right-0 w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 opacity-20 rounded-full translate-x-10 animate-bounce'></div>
          
          <div className='relative z-10'>
            <div className='flex items-center gap-4 mb-6'>
              <div className='p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm'>
                <Compass size={28} className='text-white' />
              </div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent'>
                GoJourneys
              </h1>
            </div>
            
            <h2 className='text-3xl font-bold mb-4 leading-tight'>
              Tham gia cùng chúng tôi!
            </h2>
            <p className='text-lg text-emerald-100 mb-6 leading-relaxed'>
              Khám phá thế giới và chia sẻ những trải nghiệm tuyệt vời
            </p>
            
            {/* Travel-themed features */}
            <div className='space-y-4'>
              <div className='flex items-center gap-3 text-emerald-100 group hover:text-white transition-colors duration-300'>
                <div className='p-2 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform duration-300'>
                  <MapPin size={18} />
                </div>
                <span className='text-base'>Tạo bản đồ hành trình của riêng bạn</span>
              </div>
              <div className='flex items-center gap-3 text-emerald-100 group hover:text-white transition-colors duration-300'>
                <div className='p-2 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform duration-300'>
                  <Camera size={18} />
                </div>
                <span className='text-base'>Chia sẻ ảnh và câu chuyện du lịch</span>
              </div>
              <div className='flex items-center gap-3 text-emerald-100 group hover:text-white transition-colors duration-300'>
                <div className='p-2 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform duration-300'>
                  <Globe size={18} />
                </div>
                <span className='text-base'>Khám phá gợi ý từ cộng đồng</span>
              </div>
              <div className='flex items-center gap-3 text-emerald-100 group hover:text-white transition-colors duration-300'>
                <div className='p-2 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform duration-300'>
                  <Mountain size={18} />
                </div>
                <span className='text-base'>Lên kế hoạch chuyến đi hoàn hảo</span>
              </div>
            </div>
          </div>
          
          {/* Travel illustration area */}
          <div className='relative z-10 flex justify-center items-end'>
            <div className='relative'>
              <div className='w-64 h-48 bg-gradient-to-t from-white/10 to-white/5 rounded-3xl backdrop-blur-sm border border-white/20 flex items-center justify-center relative overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent'></div>
                
                {/* Travel icons scattered */}
                <div className='relative z-10 flex items-center justify-center'>
                  <Globe size={48} className='text-white/80' />
                </div>
                
                <div className='absolute top-6 right-6 w-4 h-4 bg-yellow-400 rounded-full animate-ping'></div>
                <div className='absolute bottom-8 left-8 w-3 h-3 bg-orange-400 rounded-full animate-pulse'></div>
                <div className='absolute top-1/2 left-6 w-2 h-2 bg-pink-400 rounded-full animate-bounce'></div>
                <div className='absolute bottom-6 right-1/3 w-3 h-3 bg-blue-400 rounded-full animate-pulse'></div>
                
                {/* Small travel icons */}
                <Plane size={18} className='absolute top-8 left-1/4 text-white/60 animate-bounce' />
                <MapPin size={16} className='absolute bottom-12 right-8 text-white/60 animate-pulse' />
                <Camera size={14} className='absolute top-1/3 right-6 text-white/60 animate-ping' />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className='w-full lg:w-1/2 p-6 sm:p-12 bg-white relative'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-3xl'></div>
          
          <div className='relative z-10'>
            <div className='mb-8'>
              <h2 className='text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-700 to-teal-600 bg-clip-text text-transparent mb-2'>
                Tạo tài khoản
              </h2>
              <p className='text-gray-600 text-base'>
                Bắt đầu hành trình khám phá cùng GoJourneys! 🌍
              </p>
            </div>
            
            <div className='flex flex-col gap-5'>
              {/* Email Field */}
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-800 uppercase tracking-wide'>
                  Email
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <Mail size={20} className='text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200' />
                  </div>
                  <input
                    type='email'
                    name='email'
                    placeholder='Nhập địa chỉ email của bạn'
                    className='w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 text-base'
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Username & Full Name Row */}
              <div className='flex gap-4'>
                <div className='flex-1 space-y-2'>
                  <label className='text-sm font-semibold text-gray-800 uppercase tracking-wide'>
                    Tên đăng nhập
                  </label>
                  <div className='relative group'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <AtSign size={20} className='text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200' />
                    </div>
                    <input
                      type='text'
                      name='username'
                      placeholder='Tên đăng nhập'
                      className='w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 text-base'
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className='flex-1 space-y-2'>
                  <label className='text-sm font-semibold text-gray-800 uppercase tracking-wide'>
                    Họ và tên
                  </label>
                  <div className='relative group'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <User size={20} className='text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200' />
                    </div>
                    <input
                      type='text'
                      name='fullName'
                      placeholder='Họ và tên'
                      className='w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 text-base'
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-800 uppercase tracking-wide'>
                  Mật khẩu
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <Lock size={20} className='text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200' />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    placeholder='Tạo mật khẩu mạnh'
                    className='w-full pl-12 pr-14 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 text-base'
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
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className='flex items-start gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl'>
                <div className='w-5 h-5 border-2 border-emerald-500 rounded bg-emerald-500 flex items-center justify-center mt-0.5'>
                  <div className='w-2 h-2 bg-white rounded-sm'></div>
                </div>
                <p className='text-xs'>
                  Bằng cách tạo tài khoản, bạn đồng ý với{' '}
                  <span className='text-emerald-600 font-semibold cursor-pointer hover:text-emerald-700'>
                    Điều khoản dịch vụ
                  </span>{' '}
                  và{' '}
                  <span className='text-emerald-600 font-semibold cursor-pointer hover:text-emerald-700'>
                    Chính sách bảo mật
                  </span>{' '}
                  của GoJourneys.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type='button'
                className='w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-bold py-3 px-8 rounded-2xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 focus:ring-4 focus:ring-emerald-200 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-base'
                disabled={isPending}
                onClick={handleSubmit}
              >
                {isPending ? (
                  <div className='flex items-center justify-center gap-3'>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    Đang tạo tài khoản...
                  </div>
                ) : (
                  <div className='flex items-center justify-center gap-2'>
                    <span>Tạo tài khoản</span>
                    <Compass size={18} />
                  </div>
                )}
              </button>
              
              {isError && (
                <div className='bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl relative overflow-hidden'>
                  <div className='absolute inset-0 bg-gradient-to-r from-red-100 to-pink-100 opacity-50'></div>
                  <div className='relative z-10 font-medium text-sm'>{error.message}</div>
                </div>
              )}
            </div>

            {/* Sign In Link */}
            <div className='mt-8 text-center space-y-3'>
              <p className='text-gray-600 text-base font-medium'>
                Đã có tài khoản? 🎒
              </p>
              <Link to='/login'>
                <button className='w-full py-3 px-8 bg-white border-2 border-emerald-600 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-600 hover:text-white hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-base'>
                  <div className='flex items-center justify-center gap-2'>
                    <span>Đăng nhập</span>
                    <Plane size={18} />
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

export default SignUpPage;
