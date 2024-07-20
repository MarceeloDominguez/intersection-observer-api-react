import { useEffect, useRef, useState } from "react";

interface Post {
  id: string;
  title: string;
  content: string;
}

const mockPosts: Post[] = Array.from({ length: 60 }, (_, index) => ({
  id: (index + 1).toString(),
  title: `Post ${index + 1}`,
  content: `This is the content of post ${index + 1}`,
}));

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [postsToLoad, setPostsToLoad] = useState(20);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPostsToLoad(e.matches ? 10 : 20);
    };

    setPostsToLoad(mediaQuery.matches ? 10 : 20);
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  useEffect(() => {
    // Load initial posts
    //fetchNextPage();
    fetchInitialPosts();
  }, [postsToLoad]);

  const fetchInitialPosts = () => {
    setIsLoading(true);
    setTimeout(() => {
      const initialPosts = mockPosts.slice(0, postsToLoad);
      setPosts(initialPosts);
      setIsLoading(false);
      if (initialPosts.length < postsToLoad) setHasNextPage(false);
    }, 1000);
  };

  const fetchNextPage = () => {
    setIsLoading(true);
    // Simulando la carga de más posts con un retardo
    setTimeout(() => {
      setPosts((prevPosts) => {
        const newPosts = mockPosts.slice(
          prevPosts.length,
          prevPosts.length + postsToLoad
        );
        if (newPosts.length === 0) setHasNextPage(false); // No hay más páginas
        return [...prevPosts, ...newPosts];
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleIntersection: IntersectionObserverCallback = (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && !isLoading) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [isLoading]);

  return (
    <div className="container mx-auto p-4 bg-red-400 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-violet-600">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 h-48 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-8 bg-orange-400">
        {hasNextPage && (
          <div ref={loaderRef} className="text-center">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
