import * as React from "react";

export const Button = () => {
  return (
    <div className="rounded-md ui-bg-red">
      <div className="text-red-500 p-6 bg-blue-500">
        Read the docss
        <span className="ui-ml-2 ui-bg-gradient-to-r ui-from-brandred ui-to-brandblue ui-bg-clip-text ui-text-transparent">
          →
        </span>
      </div>
    </div>
  );
};
