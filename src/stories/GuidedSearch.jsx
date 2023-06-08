import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from './Button';
import Downshift from 'downshift';
import './GuidedSearch.scss';
import './base.css';
import './form.css';

import { ResultCard } from './Result';

const TOPICS = [
  {
    title: "Health topics",
    topics: [
      "Emergency Mental Health Services for Yale Health Members",
      "Mental Health Therapy Option for Students",
      "See all topics",
    ],
  },
  {
    title: "Coverage topics",
    topics: [
      "Confidentiality at Yale Health",
      "Mental Health Therapy Option for Students",
      "See all topics",
    ],
  },
];

const GuidedSearch = ({ state = 'landing' }) => {
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [result, setResult] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = () => {
    setIsOpen(false);
    setSubmittedSearchTerm(searchTerm)
  }

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://dev-yalehealth-yale-edu.pantheonsite.io/api/yh-solr-gs-typeahead/${searchTerm}?_format=json`
      );
      const newData = await response.json();

      setResult(newData);
    };

    if (searchTerm) {
      setIsOpen(true)
      fetchData();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (state == 'multipleResults') {
      setResult([1, 2]);
    } else if (state == 'oneResult') {
      setResult([1]);
    } else if (state == 'noResults') {
      setResult([]);
    }
    if (state == 'landing') {
      setSearchTerm(undefined);
    } else {
      setSearchTerm('Preventive Care');
    }
  }, [state]);

  const highlightTitle = (title, searchTerm) => {
    const startIndex = title.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (startIndex === -1) {
      return title;
    }
    const endIndex = startIndex + searchTerm.length;
    return (
      <span>
        {title.substring(0, startIndex)}
        <span className="guided-search-app__result-list-item guided-search-app__result-list-item--highlight">
          {title.substring(startIndex, endIndex)}
        </span>
        {title.substring(endIndex)}
      </span>
    );
  };

  const renderLanding = () => {
    return (
      <div className="guided-search-app__container">
        <form className="form">
          <Downshift
            onChange={handleSubmit}
            itemToString={(item) => (item ? item.value : '')}
            isOpen={isOpen}
          >
            {({
              getInputProps,
              getItemProps,
              getLabelProps,
              getMenuProps,
              inputValue,
              highlightedIndex,
              selectedItem,
              getRootProps,
            }) => (
              <div key={highlightedIndex}>
                <div
                  className="form__element form__element--input-textfield"
                  {...getRootProps({}, { suppressRefError: true })}
                >
                  <label className="form__label form__label--search">
                    Department, Speciality or Condition
                  </label>
                  <input
                    {...getInputProps({
                      onChange: handleChange,
                      type: 'text',
                      className: 'form__input form__input--textfield',
                    })}
                  />
                </div>
                <ul className="guided-search-app__result-list" {...getMenuProps()}>
                  {result.map((item, index) => (
                        <li
                          {...getItemProps({
                            key: item.value,
                            index,
                            item,
                            className: 'guided-search-app__result-list-item',
                            style: {
                              backgroundColor:
                                highlightedIndex === index
                                  ? '##63AAFF'
                                  : 'white',
                              fontWeight:
                                selectedItem === item ? 'bold' : 'normal',
                            },
                          })}
                        >
                          <p>{highlightTitle(item.title, inputValue)}</p>
                          {highlightTitle(item.synonym, inputValue)}
                        </li>
                      ))
                   }
                </ul>
              </div>
            )}
          </Downshift>
        </form>
        {renderSubmittedSearchTerm()}
        <div>
          {TOPICS.map((topic) => {
            return (
              <div>
                <div className="guided-search--top-heading">{topic.title}</div>
                <div className="guided-search--topic-container">
                  {topic.topics.map((item) => {
                    return <div className="guided-search--topic">{item}</div>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderNoResults = () => {
    return (
      <p className="guided-search--top-heading">
        We didn't find anything for "{searchTerm}", Perhaps one of the <br />{' '}
        links below can help.{' '}
      </p>
    );
  };

  const renderOneResult = () => {
    return (
      <div className="guided-search--common-reason">
        <h6>Common Visit reason:</h6>
        <div className="guided-search--common-reason--container">
          {REASONS.map((reason) => {
            return <p>{reason.value}</p>;
          })}
        </div>

        <div className="guided-search--result_container--left">
          <div className="guided-search--result_container--left--uppercontainer">
            <h3>{`${RESULT.value} -->`} </h3>
            <p>{RESULT.phone}</p>
          </div>
          <div className="guided-search--result_container--left--lowercontainer">
            <p>{RESULT.timing}</p>
            <button>Contact Member {RESULT.name}</button>
          </div>
          <p className="guided-search--result_container--left--address">
            {RESULT.address}
          </p>
        </div>
      </div>
    );
  };

  const renderMultipleResults = () => {
    return (
      <div>
        <span className="guided-search--top-heading">
          We Found two departments to consider
        </span>
        <div className="guided-search--result-container">
          <div className="guided-search__container--result-container--left">
            {REASONS.map((reason) => {
              return (
                <ResultCard
                  title={reason.value}
                  description={reason.description}
                  contactNo={reason.phone}
                  name={reason.name}
                  reason={reason.reason}
                  showName={reason.showName}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSubmittedSearchTerm = () => {
    let data = null;
    if (!submittedSearchTerm) {
      return null;
    }

    if (result?.length === 1) {
      data = renderOneResult();
    } else if (result.length === 2) {
      data = renderMultipleResults();
    } else {
      data = renderNoResults();
    }

    return data;
  };

  return <div>{renderLanding()}</div>;
};

GuidedSearch.propTypes = {
  state: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
};

GuidedSearch.defaultProps = {
  user: null,
};

export default GuidedSearch;
