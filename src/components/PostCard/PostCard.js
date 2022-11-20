import Link from 'next/link';

import { postPathBySlug, sanitizeExcerpt } from 'lib/posts';

import { FaMapPin } from 'react-icons/fa';
import styles from './PostCard.module.scss';

const PostCard = ({ post }) => {
  const { title, excerpt, slug, isSticky = false } = post;

  let postCardStyle = styles.articolo;

  if (isSticky) {
    postCardStyle = `${postCardStyle} ${styles.postCardSticky}`;
  }

  return (
    <div className={postCardStyle}>
      {isSticky && <FaMapPin aria-label="Sticky Post" />}
      <h3
        className={styles.subtitle}
        dangerouslySetInnerHTML={{
          __html: title,
        }}
      />
      {excerpt && (
        <div
          className={styles.postCardContent}
          dangerouslySetInnerHTML={{
            __html: sanitizeExcerpt(excerpt),
          }}
        />
      )}
      <Link href={postPathBySlug(slug)}>
        <a>
          <div className={styles.cta}>
            Leggi di più
            <span></span>
          </div>
        </a>
      </Link>
    </div>
  );
};

export default PostCard;
