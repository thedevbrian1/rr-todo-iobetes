import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";

import "./app.css";
import { ServerDown } from "./components/Icon";

export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex flex-col items-center gap-8 mt-20 max-w-3xl mx-auto text-center">
        <h1 className="text-4xl text-red-500 font-bold">
          {error.status} {error.statusText}
        </h1>
        <p className="text-red-300">{error.data}</p>
        <div className="w-80">
          <ServerDown />
        </div>
        <Link to="." className="bg-white text-black px-8 py-3 rounded-lg">
          Try again
        </Link>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="flex flex-col items-center gap-8 mt-20 max-w-3xl mx-auto text-center">
        <h1>Error</h1>
        <p>{error.message}</p>
        <div className="w-80">
          <ServerDown />
        </div>
        <Link to="." className="bg-white text-black px-8 py-3 rounded-lg">
          Try again
        </Link>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
