import { useParams } from "react-router-dom";

export const IP = () => {
  const { ip } = useParams();

  return (
    <>
      <h1>{ip}</h1>
    </>
  );
};
