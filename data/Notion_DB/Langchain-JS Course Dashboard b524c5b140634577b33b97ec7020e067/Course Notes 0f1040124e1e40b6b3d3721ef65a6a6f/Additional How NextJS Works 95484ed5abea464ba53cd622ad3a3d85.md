# Additional: How NextJS Works

Last Updated: April 5, 2024 1:05 PM

### How to Make A New Project (don’t worry about this)

- Enable tailwind, typescript, linting as necessary
    - However, you can always add them later
- Config files
    - `package.json` holds all the dependencies
        - use `npm install PACKAGE_NAME` to add new packages
    - `tailwind.config.js` for tailwind
        - Enable tailwindCSS when setting up
    - `next.config.js`
        - Modify `.env` variables, base path, etc.
        - [https://nextjs.org/docs/pages/api-reference/next-config-js](https://nextjs.org/docs/pages/api-reference/next-config-js)

### All You Need.

- What is NextJS?  [https://nextjs.org/](https://nextjs.org/)
- What is Tailwind? [https://tailwindcss.com/](https://tailwindcss.com/)
- Tailwind Cheat Sheet [https://nerdcave.com/tailwind-cheat-sheet](https://nerdcave.com/tailwind-cheat-sheet)
- API Routes in NextJS [https://nextjs.org/docs/pages/building-your-application/routing/api-routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)

### TailwindCSS

- TailwindCSS is a CSS framework that lets us write CSS faster by turning frequently used CSS into class names
- Example: Instead of using
    
    ```markdown
    
    ```
    

### React Quick Start

- React is a framework that was created to let us write our code in a more modular way with something called JSX
    - [https://legacy.reactjs.org/docs/introducing-jsx.html](https://legacy.reactjs.org/docs/introducing-jsx.html)
- Think about it like Lego, you can create new pieces and then re-use them over and over again
- Simple example:
- Use State
- Handle Submit
- Components (Parent/Child)
- Passing properties down components
    - [https://react.dev/learn/passing-props-to-a-component](https://react.dev/learn/passing-props-to-a-component)
- Ternary operator
- What’s the difference between Arrow and Functional components
    - [https://dmitripavlutin.com/differences-between-arrow-and-regular-functions/](https://dmitripavlutin.com/differences-between-arrow-and-regular-functions/)
- Why do we “use client’?
    - NextJS makes all components server components by default, which CANNOT use hooks like useState
    - So “use client” turns it into a client component
    - [https://nextjs.org/docs/getting-started/react-essentials#when-to-use-server-and-client-components](https://nextjs.org/docs/getting-started/react-essentials#when-to-use-server-and-client-components)

### API Directory

- Source: [https://nextjs.org/docs/pages/building-your-application/routing/api-routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- Put API routes in `pages/api` folder
- The name of the file will be the name of the route. E.g. `pages/api/hello.js` creats an api route named `hello`
- Use the `handler` boilerplate template
    
    ```markdown
    export default function handler(req, res) {
      res.status(200).json({ name: 'John Doe' })
    }
    ```
    
    - To access it from the frontend: