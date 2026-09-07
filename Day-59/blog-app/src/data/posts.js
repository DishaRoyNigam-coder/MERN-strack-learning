// src/data/posts.js

export const posts = [
  {
    id: 1,
    title: 'Getting Started with React',
    excerpt: 'Learn the fundamentals of React and start building modern web applications.',
    content: `
      React is a JavaScript library for building user interfaces. It was created by Facebook and is now one of the most popular frontend frameworks.

      **Why React?**
      - Component-based architecture
      - Virtual DOM for performance
      - Rich ecosystem
      - Strong community support

      In this post, we'll cover the basics of React including components, props, state, and hooks.
    `,
    author: 'Alice Johnson',
    date: '2026-09-01',
    category: 'React',
    image: 'https://picsum.photos/seed/react/800/400',
    tags: ['react', 'javascript', 'frontend']
  },
  {
    id: 2,
    title: 'Mastering useState and useEffect',
    excerpt: 'Deep dive into React hooks and how to use them effectively.',
    content: `
      Hooks are functions that let you use state and lifecycle features in functional components. The two most important hooks are useState and useEffect.

      **useState**
      useState lets you add state to functional components. It returns an array with the current state and a function to update it.

      **useEffect**
      useEffect lets you perform side effects in your components. It runs after every render by default, but you can control when it runs with the dependency array.

      In this post, we'll explore how to use these hooks effectively and avoid common pitfalls.
    `,
    author: 'Bob Smith',
    date: '2026-09-03',
    category: 'React',
    image: 'https://picsum.photos/seed/hooks/800/400',
    tags: ['react', 'hooks', 'javascript']
  },
  {
    id: 3,
    title: 'React Router: A Complete Guide',
    excerpt: 'Everything you need to know about routing in React applications.',
    content: `
      React Router is the most popular routing library for React applications. It allows you to build multi-page applications with client-side routing.

      **Key Features:**
      - Nested routes
      - Dynamic routing
      - Navigation with Link and NavLink
      - Programmatic navigation with useNavigate
      - URL parameters with useParams

      In this guide, we'll build a complete blog application with routing, nested routes, and dynamic post pages.
    `,
    author: 'Carol Davis',
    date: '2026-09-05',
    category: 'React',
    image: 'https://picsum.photos/seed/router/800/400',
    tags: ['react', 'routing', 'react-router']
  },
  {
    id: 4,
    title: 'Building a To-Do App with React',
    excerpt: 'A step-by-step guide to building a fully functional To-Do app.',
    content: `
      Building a To-Do app is the classic way to learn a new framework. In this tutorial, we'll build a complete To-Do app with React.

      **Features:**
      - Add, delete, and toggle todos
      - Filter by all, active, and completed
      - Persistent storage with localStorage
      - Clean, responsive design

      By the end of this tutorial, you'll have a production-ready To-Do app that you can use or customize.
    `,
    author: 'David Wilson',
    date: '2026-09-07',
    category: 'React',
    image: 'https://picsum.photos/seed/todo/800/400',
    tags: ['react', 'todo', 'javascript']
  },
  {
    id: 5,
    title: 'JavaScript Async/Await Explained',
    excerpt: 'Understand async/await and how it simplifies asynchronous programming.',
    content: `
      Async/await is a syntax that makes working with promises easier and more readable. It allows you to write asynchronous code that looks synchronous.

      **Why async/await?**
      - Cleaner code
      - Better error handling with try/catch
      - Easier to debug

      In this post, we'll break down async/await with practical examples and common patterns.
    `,
    author: 'Eve Brown',
    date: '2026-09-09',
    category: 'JavaScript',
    image: 'https://picsum.photos/seed/async/800/400',
    tags: ['javascript', 'async', 'await']
  },
  {
    id: 6,
    title: 'CSS Grid vs Flexbox: When to Use Which',
    excerpt: 'A comprehensive comparison of CSS Grid and Flexbox.',
    content: `
      CSS Grid and Flexbox are both powerful layout systems in CSS. Understanding when to use each is essential for building modern websites.

      **Flexbox**
      - One-dimensional (row or column)
      - Best for aligning items in a line
      - Great for navigation, cards, and form layouts

      **CSS Grid**
      - Two-dimensional (rows and columns)
      - Best for overall page layouts
      - Great for complex, grid-based designs

      In this guide, we'll compare both systems and show you when to use each.
    `,
    author: 'Frank Green',
    date: '2026-09-11',
    category: 'CSS',
    image: 'https://picsum.photos/seed/css/800/400',
    tags: ['css', 'flexbox', 'grid']
  }
];

export const getPostById = (id) => {
  return posts.find(post => post.id === parseInt(id));
};

export const getRelatedPosts = (postId, limit = 3) => {
  const currentPost = getPostById(postId);
  if (!currentPost) return [];
  return posts
    .filter(p => p.id !== parseInt(postId))
    .slice(0, limit);
};