import { useRouteError } from "react-router-dom";

export const Error = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>
          {error.status} {error.statusText || error.message}
        </i>
      </p>
    </div>
  );
};
