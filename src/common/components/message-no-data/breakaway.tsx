import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import defaults from "../../constants/defaults.json";
import "./_index.scss";
interface Props {
  buttonTo: string;
  buttonText: string;
  title: string;
  description: string;
  img?: any;
  global: any;
}

const MessageNoData = ({ buttonText, buttonTo, title, description, img, global }: Props) => {
  return (
    <div className="d-flex justify-content-center align-items-center mt-5">
      <div className="w-20">
        <img
          src={`${defaults.imageServer}/u/${global.hive_id}/avatar/lardge`}
          className="w-100 h-100"
        />
      </div>
      <div className="d-flex flex-column w-50 ml-5">
        <h2>{title}</h2>
        <p className="text-muted lead">{description}</p>
        {buttonText && (
          <Link to={buttonTo}>
            <Button className="align-self-baseline">{buttonText}</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default (p: Props) => {
  const props: Props = {
    buttonTo: p.buttonTo,
    buttonText: p.buttonText,
    title: p.title,
    description: p.description,
    img: p.img,
    global: p.global
  };

  return <MessageNoData {...props} />;
};
