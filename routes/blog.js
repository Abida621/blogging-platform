const express = require('express');
const Blog = require('../models/Blog');
const auth = require('../routes/auth'); // middleware for protected routes

const router = express.Router();

// Create a blog
router.post('/', auth, async (req, res) => {
    const { title, content } = req.body;

    try {
        const newBlog = new Blog({
            title,
            content,
            author: req.user.id
        });

        const blog = await newBlog.save();
        res.status(201).json(blog);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create blog' });
    }
});

// Get all blogs
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().populate('author', 'username');
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
});

// Get a specific blog
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'username');
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
});

// Update a blog
router.put('/:id', auth, async (req, res) => {
    const { title, content } = req.body;

    try {
        const blog = await Blog.findById(req.params.id);

        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({ error: 'User not authorized' });
        }

        blog.title = title;
        blog.content = content;

        await blog.save();
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update blog' });
    }
});

// Delete a blog
router.delete('/:id', auth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({ error: 'User not authorized' });
        }

        await blog.remove();
        res.json({ message: 'Blog deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

module.exports = router;
