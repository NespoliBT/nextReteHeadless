import { getPaginatedPosts } from 'lib/posts';

import Layout from 'components/Layout';
import PostCard from 'components/PostCard';
import Pagination from 'components/Pagination';

import styles from 'styles/pages/Articoli.module.scss';

export default function Home({ posts, pagination }) {
    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.title}>
                    <h1>Articoli</h1>
                </div>
                <div className={styles.posts}>
                    {posts.map((post) => {
                        return (
                            <PostCard post={post} />
                        );
                    })}
                </div>
                {pagination && (
                    <Pagination
                        addCanonical={false}
                        currentPage={pagination?.currentPage}
                        pagesCount={pagination?.pagesCount}
                        basePath={pagination?.basePath}
                    />
                )}
            </div>
        </Layout>
    );
}

export async function getStaticProps() {
    const { posts, pagination } = await getPaginatedPosts({
        queryIncludes: 'archive',
    });
    return {
        props: {
            posts,
            pagination: {
                ...pagination,
                basePath: '/articoli',
            },
        },
    };
}
