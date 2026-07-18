import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, BlogProvider, CategoryProvider, CommentProvider } from './context';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Articles from './pages/Articles';
import MainLayout from './pages/MainLayout';
import UserLayout from './pages/UserLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import BlogDetailPage from './pages/BlogDetailPage';
import DashboardLayout from './pages/admin/DashboardLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AddBlogPage from './pages/admin/AddBlogPage';
import EditBlogPage from './pages/admin/EditBlogPage';
import BlogListsPage from './pages/admin/BlogListsPage';
import CommentsPage from './pages/admin/CommentsPage';
import UsersPage from './pages/admin/UsersPage';
import SettingsPage from './pages/admin/SettingsPage';
import CategoryPage from './pages/CategoryPage';
import About from './pages/About';
import Contact from './pages/Contact';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4f46e5',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <AuthProvider>
        <BlogProvider>
          <CategoryProvider>
            <CommentProvider>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/blog/:id" element={<BlogDetailPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                </Route>

                <Route element={<UserLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="add-blog" element={<AddBlogPage />} />
                  <Route path="edit-blog/:id" element={<EditBlogPage />} />
                  <Route path="blog-lists" element={<BlogListsPage />} />
                  <Route path="comments" element={<CommentsPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </CommentProvider>
          </CategoryProvider>
        </BlogProvider>
      </AuthProvider>
    </>
  );
};

export default App;