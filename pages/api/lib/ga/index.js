// lib/ga/index.js
import ReactGA from "react-ga4";

export const GA_TRACKING_ID = "G-5194FX0QZR"; // Replace with your ID

export const initGA = () => {
  ReactGA.initialize(GA_TRACKING_ID);
};

export const logPageView = (url) => {
  ReactGA.send({ hitType: "pageview", page: url });
};
