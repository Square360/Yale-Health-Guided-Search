import React, { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Downshift from 'downshift';
// import './GuidedSearch.scss';
// import './base.css';
// import './form.css';
import parse from 'html-react-parser';
import { DebounceInput } from 'react-debounce-input';

const GuidedSearch = () => {
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState({});
  const [result, setResult] = useState([]);
  const [departmentInfo, setDepartmentInfo] = useState([]);
  const [healthTopics, setHealthTopics] = useState([]);
  const [coverageTopics, setCoverageTopics] = useState([]);
  const [commonReasons, setCommonReasons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef();

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleTest = () => {
    setIsEditing(true);
    inputRef.current.focus();
  };

  const handleSubmit = (item) => {
    if (item.nid) {
      const urls = [
        `https://live-yalehealth-yale-edu.pantheonsite.io/guidedsearch/topics/health/${item.nid}?_format=json`,
        `https://live-yalehealth-yale-edu.pantheonsite.io/guidedsearch/topics/coverage/${item.nid}?_format=json`,
        `https://live-yalehealth-yale-edu.pantheonsite.io/guided-search/department/${item.nid}?_format=json`,
      ];
      Promise.all(urls.map((url) => fetch(url).then((r) => r.json())))
        .then(([healthTopics, coverageTopics, departmentInfo]) => {
          setCommonReasons([]);
          setHealthTopics(healthTopics);
          setCoverageTopics(coverageTopics);
          setDepartmentInfo(departmentInfo);
        })
        .catch((error) => console.log(error));
    }

    setIsOpen(false);
    setSubmittedSearchTerm(item);
    setSearchTerm(item.title || item.synonym);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://live-yalehealth-yale-edu.pantheonsite.io/guidedsearch/topics/health?_format=json`
      );
      const newData = await response.json();

      setCommonReasons(newData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://live-yalehealth-yale-edu.pantheonsite.io/api/yh-solr-gs-typeahead/${searchTerm}?_format=json`
      );
      const newData = await response.json();

      setResult(newData);
    };

    if (searchTerm) {
      setIsOpen(true);
      fetchData();
    }
  }, [searchTerm]);

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
      <>
        {title.substring(0, startIndex)}
        <strong>{title.substring(startIndex, endIndex)}</strong>
        {title.substring(endIndex)}
      </>
    );
  };

  const renderLanding = () => {
    return (
      <div className="guided-search-app">
        <form className="form">
          <Downshift
            onChange={(item) => handleSubmit(item)}
            itemToString={(item) => (item ? item.title : '')}
            defaultHighlightedIndex={0}
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
              <div>
                <div
                  className="form__element form__element--input-textfield"
                  {...getRootProps({}, { suppressRefError: true })}
                >
                  <label
                    className="form__label form__label--search"
                    onClick={handleTest}
                  >
                    Department, Specialty or Condition
                  </label>
                  <DebounceInput
                    {...getInputProps({
                      type: 'text',
                      className: 'form__input form__input--textfield',
                      inputRef: inputRef,
                      onChange: handleChange,
                      debounceTimeout: 300,
                      onBlur: handleChange,
                      value: searchTerm,
                    })}
                  />
                </div>
                {isOpen && (
                  <ul
                    className="guided-search-app__result-list"
                    {...getMenuProps()}
                  >
                    {result?.map((item, index) => (
                      <li
                        key={index}
                        {...getItemProps({
                          index,
                          item,
                          isActive: highlightedIndex === index,
                          isSelected: selectedItem === item,
                          className: 'guided-search-app__result-list-item',
                        })}
                      >
                        <div className="guided-search-app__result-synonym">
                          {highlightTitle(item.synonym, inputValue)}
                        </div>
                        <div className="guided-search-app__result-title">
                          {highlightTitle(item.title, inputValue)}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Downshift>
        </form>
        {renderNoResults()}
        {renderSubmittedSearchTerm()}
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
        <p className="guided-search-app__no-results">
          We didn't find anything for "{submittedSearchTerm.title}", Perhaps one
          of the links below can help.
        </p>
      );
    }
    return data;
  };

  const renderSubmittedSearchTerm = () => {
    let data = null;

    data = (
      <div className="guided-search-app__search-results">
        {departmentInfo.length > 0 && (
          <div className="guided-search-app__departments">
            {departmentInfo.map((department, index) => {
              return (
                <article className="department" key={index}>
                  <div className="department__heading">
                    <a href={department.url}>{parse(department.title)}</a>
                  </div>
                  {department.phone && (
                    <div className="department__phone">
                      {parse(department.phone)}
                    </div>
                  )}
                  {department.restrictions && (
                    <div className="department__restrictions">
                      {parse(department.restrictions)}
                    </div>
                  )}

                  {departmentInfo.length === 1 && (
                    <>
                      {department.hours && (
                        <div className="department__hours">
                          {parse(department.hours)}
                        </div>
                      )}
                      {department.location && (
                        <div className="department__location">
                          {parse(department.location)}
                        </div>
                      )}
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
        {renderCTA()}
      </div>
    );

    return data;
  };

  const renderCTA = () => {
    let data = null;

    if (submittedSearchTerm.cta_link && submittedSearchTerm.cta_text) {
      data = (
        <div className="guided-search-app__cta">
          <div className="guided-search-app__cta-text">
            {parse(submittedSearchTerm.cta_text || '')}
          </div>
          <div className="guided-search-app__cta-link">
            <a href={submittedSearchTerm.cta_link}>
              {parse(submittedSearchTerm.cta_link_title)}
            </a>
          </div>
        </div>
      );
    } else if (!submittedSearchTerm.cta_link && submittedSearchTerm.cta_text) {
      data = (
        <div className="guided-search-app__cta">
          <div className="guided-search-app__cta-text">
            {parse(submittedSearchTerm.cta_text || '')}
          </div>
        </div>
      );
    } else if (submittedSearchTerm.cta_link && !submittedSearchTerm.cta_text) {
      data = (
        <div className="guided-search-app__cta">
          <div className="guided-search-app__cta-link">
            {
              <a href={submittedSearchTerm.cta_link}>
                {parse(submittedSearchTerm.cta_link_title)}
              </a>
            }
          </div>
        </div>
      );
    }

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
        <div className="guided-search-app__common-reasons">
          Common reasons
          <ul className="guided-search-app__common-reasons-list">
            {commonReasons.map((reason) => {
              return (
                <li
                  className="guided-search-app__common-reasons-list-item"
                  key={reason.nid}
                >
                  <a href={reason.url}>{parse(reason.title)} </a>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    return data;
  };

  const renderHealthTopics = () => {
    let data = null;

    if (healthTopics.length) {
      data = (
        <div className="guided-search-app__topics guided-search-app__topics--health">
          Health Topics
          <ul className="guided-search-app__topic-list">
            {healthTopics?.map((topic) => {
              return (
                <li
                  className="guided-search-app__topic-list-item"
                  key={topic.nid}
                >
                  <a href={topic.url}>{parse(topic.title)} </a>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    return data;
  };

  const renderCoverageTopics = () => {
    let data = null;

    if (coverageTopics.length) {
      data = (
        <div className="guided-search-app__topics guided-search-app__topics--coverage">
          Coverage Topics
          <ul className="guided-search-app__topic-list">
            {coverageTopics?.map((topic) => {
              return (
                <li
                  className="guided-search-app__topic-list-item"
                  key={topic.nid}
                >
                  <a href={topic.url}>{parse(topic.title)} </a>
                </li>
              );
            })}
          </ul>
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
