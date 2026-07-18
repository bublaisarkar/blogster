// pages/Contact.jsx
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ✅ Using EmailJS (free service)
      // Sign up at https://www.emailjs.com/ and get your credentials
      const result = await emailjs.send(
        'service_jvee93e',      // Replace with your EmailJS service ID
        'template_12rlqdu',     // Replace with your EmailJS template ID
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_email: 'bublaisarkar01@gmail.com',
        },
        '_9MlT739UQpaxPZmT'       // Replace with your EmailJS public key
      );

      if (result.status === 200) {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error('Email sending error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-[#edebf5] shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 sm:px-8 py-8 sm:py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Get in Touch</h1>
          <p className="text-indigo-100 mt-2 text-lg">We'd love to hear from you</p>
        </div>

        <div className="px-6 sm:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-[#f8f7fc] rounded-xl">
              <i className="fas fa-envelope text-2xl text-indigo-600 mb-2"></i>
              <h4 className="font-medium text-[#14141f]">Email</h4>
              <a href="mailto:bublaisarkar01@gmail.com" className="text-sm text-[#6b6b84] hover:text-indigo-600 transition">
                bublaisarkar01@gmail.com
              </a>
            </div>
            <div className="text-center p-4 bg-[#f8f7fc] rounded-xl">
              <i className="fab fa-linkedin text-2xl text-[#0A66C2] mb-2"></i>
              <h4 className="font-medium text-[#14141f]">LinkedIn</h4>
              <a 
                href="https://www.linkedin.com/in/bublai-sarkar/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-[#6b6b84] hover:text-indigo-600 transition"
              >
                Connect with me
              </a>
            </div>
            <div className="text-center p-4 bg-[#f8f7fc] rounded-xl">
              <i className="fas fa-globe text-2xl text-indigo-600 mb-2"></i>
              <h4 className="font-medium text-[#14141f]">Website</h4>
              <a 
                href="/" 
                className="text-sm text-[#6b6b84] hover:text-indigo-600 transition"
              >
                Blogster
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
                  Your Name *
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[#2d2d3f] mb-1.5">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6ed] bg-[#faf9f6] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm resize-none"
                placeholder="Your message here..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;