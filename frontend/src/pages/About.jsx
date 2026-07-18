// pages/About.jsx

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-[#edebf5] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 sm:px-8 py-8 sm:py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">About Blogster</h1>
          <p className="text-indigo-100 mt-2 text-lg">Where ideas come to life</p>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-8 py-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#14141f]">Our Mission</h2>
            <p className="text-[#2d2d3f] mt-2 leading-relaxed">
              Blogster is a platform dedicated to sharing insightful articles on technology, design, productivity, AI, and culture. 
              We believe in the power of ideas and the importance of thoughtful discourse.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[#f8f7fc] rounded-xl p-5">
              <div className="text-3xl mb-2">📝</div>
              <h3 className="font-semibold text-[#14141f]">Quality Content</h3>
              <p className="text-sm text-[#6b6b84] mt-1">Carefully curated articles from passionate writers</p>
            </div>
            <div className="bg-[#f8f7fc] rounded-xl p-5">
              <div className="text-3xl mb-2">🌍</div>
              <h3 className="font-semibold text-[#14141f]">Global Community</h3>
              <p className="text-sm text-[#6b6b84] mt-1">Connecting readers and writers from around the world</p>
            </div>
            <div className="bg-[#f8f7fc] rounded-xl p-5">
              <div className="text-3xl mb-2">💡</div>
              <h3 className="font-semibold text-[#14141f]">Diverse Perspectives</h3>
              <p className="text-sm text-[#6b6b84] mt-1">Exploring ideas from technology to culture</p>
            </div>
            <div className="bg-[#f8f7fc] rounded-xl p-5">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-semibold text-[#14141f]">Innovation</h3>
              <p className="text-sm text-[#6b6b84] mt-1">Staying ahead with the latest trends and insights</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#14141f]">Meet the Creator</h2>
            <div className="flex items-center gap-4 mt-3 bg-[#f8f7fc] rounded-xl p-5">
              {/* ✅ Profile Image from public folder */}
              <img 
                src="/portfollio_picture.png" 
                alt="Bublai Sarkar" 
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 flex-shrink-0"
              />
              <div>
                <h4 className="font-semibold text-[#14141f]">Bublai Sarkar</h4>
                <p className="text-sm text-[#6b6b84]">Full-Stack Developer & Creator</p>
                <div className="flex gap-3 mt-2">
                  <a 
                    href="https://www.linkedin.com/in/bublai-sarkar/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 transition"
                    aria-label="LinkedIn"
                  >
                    <i className="fab fa-linkedin text-xl"></i>
                  </a>
                  <a 
                    href="https://github.com/bublaisarkar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#24292e] hover:text-[#1a1a1a] transition"
                    aria-label="GitHub"
                  >
                    <i className="fab fa-github text-xl"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;