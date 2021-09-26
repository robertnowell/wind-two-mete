import React from "react";

export const CellAvailability = ({
  names,
  allNames,
}: {
  names: string[] | null;
  allNames: string[];
}) => {
  if (!names) {
    return (
      <div>
        <h4>Hover a cell to see availability</h4>
      </div>
    );
  }

  const notFree = allNames.filter((name) => !names.includes(name));

  return (
    <div>
      <h4>
        {names.length}/{allNames.length}
      </h4>
      <div>Available: {names.join(", ")}</div>
      <div>Not Available: {notFree.join(", ")}</div>
    </div>
  );
};
