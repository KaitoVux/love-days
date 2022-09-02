import React, { FC } from "react";

export const Footer: FC = () => {
    const title = "Thank you for your love 💕";
    return (
        <div className="text-center mt-40 mb-8">
            <p className="text-5xl text-purple-500">{title}</p>
        </div>
    );
};
