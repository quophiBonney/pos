import React from 'react'

const RegisterationForm = () => {
  return (
          <div className="h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="">
      <img src="https://images.pexels.com/photos/12935088/pexels-photo-12935088.jpeg" alt="" className="h-full object-cover"/>
      </div>
      <div className="flex items-center px-5 lg:px-10 xl:px-16">
        <form className="w-full">
            <div className="mb-10">
                <h3 className="text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase">Complete Your Registration</h3>
            <p>Fill the form below with your details to complete your registration</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group">
                <label htmlFor='firstName'>First Name</label>
                <input type="text" className="w-full p-3 xl:p-4 bg-gray-100 border-2 border-gray-200 rounded" placeholder=''/>
            </div>
             <div className="form-group">
                <label htmlFor='lastName'>Last Name</label>
                <input type="text" className="w-full p-3 xl:p-4 bg-gray-100 border-2 border-gray-200 rounded"/>
            </div>
             <div className="form-group">
                <label htmlFor='email'>Email</label>
                <input type="email" className="w-full p-3 xl:p-4 bg-gray-100 border-2 border-gray-200 rounded"/>
            </div>
             <div className="form-group">
                <label htmlFor='username'>Username</label>
                <input type="text" className="w-full p-3 xl:p-4 bg-gray-100 border-2 border-gray-200 rounded"/>
            </div>
             <div className="form-group">
                <label htmlFor='username'>Last Name</label>
                <input type="text" className="w-full p-3 xl:p-4 bg-gray-100 border-2 border-gray-200 rounded"/>
            </div>
             <div className="form-group">
                <label htmlFor='password'>Password</label>
                <input type="text" className="w-full p-3 xl:p-4 bg-gray-100 border-2 border-gray-200 rounded"/>
            </div>
            </div>
            <div className="form-group mt-5">
                <button type="submit" className="bg-blue-500 text-white w-full p-3 xl:p-4 rounded">Register</button>
            </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterationForm
