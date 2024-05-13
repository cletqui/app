export const Table = ({ list }) => {
  return (
    <table>
      <thead>
        <tr>
          {Object.keys(list[0]).map((key, index) => (
            <th key={index}>{key}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {list.map((item, rowIndex) => (
          <tr key={rowIndex}>
            {Object.values(item).map((value, colIndex) => (
              <td key={`${rowIndex}-${colIndex}`}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
