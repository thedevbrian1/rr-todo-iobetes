import {
  data,
  Form,
  isRouteErrorResponse,
  Link,
  useNavigation,
  useRouteError,
} from "react-router";
import { EmptyClipboard, ServerDown } from "../components/Icon";
import { validateText } from "../.server/validation";
import { commitSession, getSession } from "../.server/session";
import { useEffect, useRef } from "react";

export function meta() {
  return [
    { title: "Todo App" },
    { name: "description", content: "Keep track of your tasks easily!" },
  ];
}

export async function loader({ request }) {
  let session = await getSession(request.headers.get("Cookie"));
  let tasks = session.get("tasks");

  return { tasks };
}

export async function action({ request }) {
  // 1) Get user info
  // 2) Validate
  // 3) Store user info in the session

  let session = await getSession(request.headers.get("Cookie"));

  let formData = await request.formData();
  let task = formData.get("task");

  // Validation
  let fieldErrors = {
    task: validateText(task),
  };

  // Return errors if any
  if (Object.values(fieldErrors).some(Boolean)) {
    return { fieldErrors };
  }

  // Store to the session

  let tasks = session.get("tasks") || [];

  let newTasks = [...tasks];

  newTasks.push(task);

  session.set("tasks", newTasks);

  return data(
    { ok: true },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export default function Home({ loaderData, actionData }) {
  let formRef = useRef(null);
  let navigation = useNavigation();

  let isSubmitting = navigation.state !== "idle";

  // Clear form after submission
  useEffect(() => {
    formRef.current.reset();
  }, [isSubmitting]);

  return (
    <main className="max-w-xl mx-auto mt-20">
      <Form method="post" ref={formRef}>
        <input
          type="text"
          name="task"
          aria-label="Enter task"
          placeholder="Enter task"
          className={`w-full p-4 border ${actionData?.fieldErrors?.task ? "border-red-500" : "border-amber-600"}  rounded-lg`}
        />
        {actionData?.fieldErrors?.task ? (
          <p className="text-red-500 mt-2">{actionData.fieldErrors.task}</p>
        ) : null}
      </Form>

      <ul className="mt-8 space-y-4 text-gray-300">
        {loaderData?.tasks ? (
          loaderData.tasks.map((item, index) => (
            <Todoitem
              key={`task-${index}`}
              name={`task-${index}`}
              htmlFor={`task-${index}`}
              text={item}
            />
          ))
        ) : (
          <div>
            <div className="w-40 mx-auto">
              <EmptyClipboard />
            </div>
            <p className="text-center mt-8 text-gray-400">Empty list</p>
          </div>
        )}
      </ul>
    </main>
  );
}

function Todoitem({ name, id, htmlFor, text }) {
  return (
    <li className="flex gap-2 items-center">
      <input type="checkbox" name={name} id={id} />
      <label htmlFor={htmlFor}>{text}</label>
    </li>
  );
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
        <h1 className="text-4xl text-red-500 font-bold">Error</h1>
        <p className="text-red-300">{error.message}</p>
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
