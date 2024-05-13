export const Code = ({ data }) => {
  return (
    <div className="code">
      <code>
        {Object.entries(data).map(([key, value], index) => {
          return <p key={index}>{`${key}: ${value}`}</p>;
        })}
      </code>
    </div>
  );
};
