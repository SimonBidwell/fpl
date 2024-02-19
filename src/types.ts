import * as React from "react";

// enable variables in CSS properties by augmenting the CSSProperties interface in the react types
// https://twitter.com/chancethedev/status/1757879888311439814
declare module 'react' {
    interface CSSProperties {
        [key: `--${string}`]: string | number
    }
}