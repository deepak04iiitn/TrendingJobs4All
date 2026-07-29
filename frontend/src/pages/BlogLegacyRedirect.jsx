import { Navigate, useParams } from 'react-router-dom';

/** Redirect legacy /blogs/:slug/:id URLs to /blogs/:slug */
export default function BlogLegacyRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/blogs/${slug}`} replace />;
}
