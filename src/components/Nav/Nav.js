import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { FaSearch } from 'react-icons/fa';

import useSite from 'hooks/use-site';
import useSearch, { SEARCH_STATE_LOADED } from 'hooks/use-search';
import { postPathBySlug } from 'lib/posts';
import { findMenuByLocation, MENU_LOCATION_NAVIGATION_DEFAULT } from 'lib/menus';

import styles from './Nav.module.scss';
import NavListItem from 'components/NavListItem';

const Nav = () => {
  const formRef = useRef();
  const headerRef = useRef();

  const [searchVisibility, setSearchVisibility] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuClosing, setMobileMenuClosing] = useState(false);

  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    setHeaderHeight(headerRef.current.offsetHeight);
  }, []);

  const { menus } = useSite();

  const navigationLocation = process.env.WORDPRESS_MENU_LOCATION_NAVIGATION || MENU_LOCATION_NAVIGATION_DEFAULT;
  const navigation = findMenuByLocation(menus, navigationLocation);

  const { query, results, search, clearSearch, state } = useSearch({
    maxResults: 5,
  });

  const searchIsLoaded = state === SEARCH_STATE_LOADED;

  // When the search visibility changes, we want to add an event listener that allows us to
  // detect when someone clicks outside of the search box, allowing us to close the results
  // when focus is drawn away from search

  useEffect(() => {
    // If we don't have a query, don't need to bother adding an event listener
    // but run the cleanup in case the previous state instance exists

    console.log('searchVisibility', searchVisibility);

    if (searchVisibility === false) {
      removeDocumentOnClick();
      return;
    } else {
      console.log(formRef);
      const searchInput = Array.from(formRef.current.elements).find((input) => input.type === 'text');

      searchInput.focus();
    }

    addDocumentOnClick();
    addResultsRoving();

    // When the search box opens up, additionall find the search input and focus
    // on the element so someone can start typing right away

    return () => {
      removeResultsRoving();
      removeDocumentOnClick();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchVisibility]);

  /**
   * addDocumentOnClick
   */

  function addDocumentOnClick() {
    document.body.addEventListener('click', handleOnDocumentClick, true);
  }

  /**
   * removeDocumentOnClick
   */

  function removeDocumentOnClick() {
    document.body.removeEventListener('click', handleOnDocumentClick, true);
  }

  /**
   * handleOnDocumentClick
   */

  function handleOnDocumentClick(e) {
    if (!e.composedPath().includes(formRef.current)) {
      setSearchVisibility(false);
      clearSearch();
    }
  }

  /**
   * handleOnSearch
   */

  function handleOnSearch({ currentTarget }) {
    search({
      query: currentTarget.value,
    });
  }

  /**
   * handleOnToggleSearch
   */

  function handleOnToggleSearch() {
    setSearchVisibility(!searchVisibility);
  }

  /**
   * addResultsRoving
   */

  function addResultsRoving() {
    document.body.addEventListener('keydown', handleResultsRoving);
  }

  /**
   * removeResultsRoving
   */

  function removeResultsRoving() {
    document.body.removeEventListener('keydown', handleResultsRoving);
  }

  /**
   * handleResultsRoving
   */

  function handleResultsRoving(e) {
    const focusElement = document.activeElement;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (focusElement.nodeName === 'INPUT' && focusElement.nextSibling.children[0].nodeName !== 'P') {
        focusElement.nextSibling.children[0].firstChild.firstChild.focus();
      } else if (focusElement.parentElement.nextSibling) {
        focusElement.parentElement.nextSibling.firstChild.focus();
      } else {
        focusElement.parentElement.parentElement.firstChild.firstChild.focus();
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (focusElement.nodeName === 'A' && focusElement.parentElement.previousSibling) {
        focusElement.parentElement.previousSibling.firstChild.focus();
      } else {
        focusElement.parentElement.parentElement.lastChild.firstChild.focus();
      }
    }
  }

  /**
   * escFunction
   */

  // pressing esc while search is focused will close it

  const escFunction = useCallback((event) => {
    if (event.keyCode === 27) {
      clearSearch();
      setSearchVisibility(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', escFunction, false);

    return () => {
      document.removeEventListener('keydown', escFunction, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openMobileMenu = () => {
    setMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setMobileMenuClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setMobileMenuClosing(false);
    }, 300);
  };

  return (
    <>
      <div className={styles.header} ref={headerRef}>
        <div className={styles.logoContainer}>
          <Link href="/">
            <img className={styles.logo} src="/img/logo.png" alt="logo" />
          </Link>
        </div>
        <div className={styles.mobileMenuButton} onClick={openMobileMenu}>
          
        </div>
        <nav className={styles.menu}>
          <ul>
            {navigation?.map((listItem) => {
              return <NavListItem key={listItem.id} item={listItem} className={styles.menuItem} />;
            })}
          </ul>
          <div className={styles.navSearch}>
            <button onClick={handleOnToggleSearch} disabled={!searchIsLoaded}>
              <FaSearch />
            </button>
            {searchVisibility && (
              <form ref={formRef} action="/search" data-search-is-active={!!query}>
                <input
                  type="text"
                  name="q"
                  value={query || ''}
                  onChange={handleOnSearch}
                  autoComplete="off"
                  placeholder="Cerca..."
                  required
                />
                <div className={styles.navSearchResults}>
                  {results.length > 0 && (
                    <ul>
                      {results.map(({ slug, title }, index) => {
                        return (
                          <li key={slug}>
                            <Link tabIndex={index} href={postPathBySlug(slug)}>
                              <a>{title}</a>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {results.length === 0 && query && (
                    <p>
                      Nessun risultato per: <strong>{query}</strong>
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </nav>
        {mobileMenuOpen && (
          <nav className={[styles.mobileMenu, mobileMenuClosing && styles.closing].join(' ')}>
            <div className={styles.mobileMenuCloseButton} onClick={closeMobileMenu}>
              
            </div>
            <ul>
              <li>
                <Link href="/">
                  <img className={styles.logo} src="/img/logo.png" alt="logo" />
                </Link>
              </li>
              {navigation?.map((listItem) => {
                return <NavListItem key={listItem.id} item={listItem} className={styles.menuItem} />;
              })}
            </ul>
          </nav>
        )}
      </div>
      <div style={{ marginTop: `${headerHeight}px` }} />
    </>
  );
};

export default Nav;
