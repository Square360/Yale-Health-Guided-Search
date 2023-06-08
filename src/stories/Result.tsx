import React from 'react';
import './Result.scss';

type Props = {};

export const ResultCard = ({
  title = 'Behavioral Health',
  description = 'For Employees & Covered Dependents/ Referral Required',
  contactNo = '800-245-4561',
  name,
  reason,
  showName,
}: any) => {
  return (
    <div className="result_card__container">
      <div className="result_card--left_container">
        <span className="result_card--title">
          <a href="#">{title}</a>
        </span>
        <span className="result_card--description">{description}</span>
        <span className="result_card--contact">{contactNo}</span>
      </div>
      <div className="result_card--right_container">
        {showName && (
          <div>
            <h4>
              Call {name}(<span>{contactNo}</span>)
            </h4>
            <p>and follow the options on the telephone tree:</p>
          </div>
        )}
        <p>
          <b>Press 2,</b>
          {reason}
        </p>
      </div>
    </div>
  );
};
