import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from './Button';
import Downshift from 'downshift';
import './GuidedSearch.scss';
import './base.css';
import './form.css';
import parse from 'html-react-parser';

import { ResultCard } from './Result';

const GuidedSearch = ({ state = 'landing' }) => {
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState({});
  const [result, setResult] = useState([]);
  const [departmentInfo, setDepartmentInfo] = useState([]);
  const [healthTopics, setHealthTopics] = useState([]);
  const [coverageTopics, setCoverageTopics] = useState([]);
  const [commonReasons, setCommonReasons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (item) => {
    console.log(':::', item);
    if (submittedSearchTerm.synonym) {
      const urls = [
        `https://yh-205-yalehealth-yale-edu.pantheonsite.io/guidedsearch/topics/health/${item.nid}?_format=json`,
        `https://yh-205-yalehealth-yale-edu.pantheonsite.io/guidedsearch/topics/coverage/${item.nid}?_format=json`,
        `https://yh-205-yalehealth-yale-edu.pantheonsite.io/guided-search/department/${item.nid}?_format=json`,
      ];
      Promise.all(urls.map((url) => fetch(url).then((r) => r.json())))
        .then(([healthTopics, coverageTopics, departmentInfo]) => {
          console.log(":::D", departmentInfo)
          setCommonReasons([]);
          setHealthTopics(healthTopics);
          setCoverageTopics(coverageTopics);
          setDepartmentInfo(departmentInfo);
        })
        .catch((error) => console.log(error));
    }

    setIsOpen(false);
    setSubmittedSearchTerm(item);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://yh-205-yalehealth-yale-edu.pantheonsite.io/guidedsearch/topics/health?_format=json`
      );
      const newData = await response.json();

      setCommonReasons(newData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://yh-205-yalehealth-yale-edu.pantheonsite.io/api/yh-solr-gs-typeahead/${searchTerm}?_format=json`
      );
      const newData = await response.json();

      setResult(newData);
    };

    if (searchTerm) {
      setIsOpen(true);
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
    let startIndex = -1;

    if (searchTerm) {
      startIndex = title.toLowerCase().indexOf(searchTerm.toLowerCase());

      if (startIndex === -1) {
        return title;
      }
    }

    const endIndex = startIndex + searchTerm?.length || -1;
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
            onChange={(item) => handleSubmit(item)}
            itemToString={(item) => (item ? item.title : '')}
          >
            {({
              getInputProps,
              getItemProps,
              getLabelProps,
              getMenuProps,
              inputValue,
              highlightedIndex,
              isOpen,
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
                <ul
                  className="guided-search-app__result-list"
                  {...getMenuProps()}
                >
                  {isOpen &&
                    result?.map((item, index) => (
                      <li
                        {...getItemProps({
                          key: item.value,
                          index,
                          item,
                          className: 'guided-search-app__result-list-item',
                          style: {
                            backgroundColor:
                              highlightedIndex === index ? '##63AAFF' : 'white',
                            fontWeight:
                              selectedItem === item ? 'bold' : 'normal',
                          },
                        })}
                      >
                        <p>{highlightTitle(item.title, inputValue)}</p>
                        {highlightTitle(item.synonym, inputValue)}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </Downshift>
        </form>
        {renderSubmittedSearchTerm()}
        {renderNoResults()}
        {renderCommonReasons()}
        {renderHealthTopics()}
        {renderCoverageTopics()}
      </div>
    );
  };

  const renderNoResults = () => {
    let data = null;

    if (!departmentInfo.length && submittedSearchTerm.title) {
      data = (
        <p className="guided-search--top-heading">
        We didn't find anything for "{submittedSearchTerm.title}", Perhaps one of the <br />{' '}
        links below can help.{' '}
      </p>
      )
    }
    return data;
  };

  const renderSubmittedSearchTerm = () => {
    let data = null;
    if (!submittedSearchTerm.synonym) {
      return null;
    }
    data = (
      <div>
        <div>
          {submittedSearchTerm.title}
          {submittedSearchTerm.cta_link && (
            <a href={submittedSearchTerm.cta_link}>
              {submittedSearchTerm.cta_link_title}{' '}
            </a>
          )}
          {!submittedSearchTerm.cta_link &&
            parse(submittedSearchTerm.cta_text || '')}
        </div>
        {departmentInfo.map((department) => {
          return (
            <div>
              <span>{department.title}</span>
              {parse(department.restrictions || '')}
              {parse(department.phone || '')}
              {parse(department.hours || '')}
              {parse(department.location || '')}
            </div>
          );
        })}
      </div>
    );

    return data;
  };

  const renderCommonReasons = () => {
    let data = null;

    if (
      commonReasons.length &&
      !submittedSearchTerm.synonym &&
      !submittedSearchTerm.title
    ) {
      data = (
        <div className="guided-search--top-heading">
          <span>Common reasons</span>
          {commonReasons.map((reason) => {
            return (
              <div key={reason.nid}>
                <span className="guided-search--topic">
                  <a href={reason.url}>{reason.title} </a>
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    return data;
  };

  const renderHealthTopics = () => {
    let data = null;

    if (healthTopics.length) {
      data = (
        <div className="guided-search--top-heading">
          <span>Health Topics</span>
          {healthTopics?.map((topic) => {
            return (
              <div key={topic.nid}>
                <a href={topic.url}>{topic.title} </a>
              </div>
            );
          })}
        </div>
      );
    }

    return data;
  };

  const renderCoverageTopics = () => {
    let data = null;

    if (coverageTopics.length) {
      data = (
        <div className="guided-search--top-heading">
          <span>Coverage Topics</span>
          {coverageTopics?.map((topic) => {
            return (
              <div key={topic.nid}>
                <span className="guided-search--topic">
                  <a href={topic.url}>{topic.title} </a>
                </span>
              </div>
            );
          })}
        </div>
      );
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
