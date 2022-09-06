const blogModel = require("../model/blogModel");
const authorModel = require("../model/authorModel");
const moment = require("moment");
const createBlog = async function (req, res) {
    try {
        const blog = req.body;
        const authorId = blog.authorId;

        if (!authorId) {
            return res.send({ status: false, msg: "Plz enter author id" });
        }
        const isValidAuthor = await authorModel.findById(authorId);
        if (!isValidAuthor) {
            return res.send({ status: false, msg: "Author dosen't exist" });
        }
        if (blog.isPublished == true) {
            blog.publishedAt = moment();
        }
        const saveBlog = await blogModel.create(blog);
        return res.status(201).send({
            status: true,
            data: saveBlog,
        });
    } catch (err) {
        return res.status(400).send({
            status: false,
            msg: err.message,
        });
    }
};

const blogsDetails = async function (req, res) {
    try {
        let filter = req.query;
        let fsize = Object.entries(filter).length;
        if (fsize < 1) {
            try {
                let data = await blogModel.find({
                    ispublished: true,
                    isDeleted: false,
                });
                if (!data)
                    return res.status(404).send({ status: false, msg: "No Blogs found" });
                return res.status(200).send({ status: true, msg: data });
            } catch (error) {
                res.status(500).send({ status: false, msg: error.message });
            }
        }
        let data = await blogModel.find(filter);
        let size = data.length;
        if (size < 1)
            return res.status(404).send({ status: false, msg: "No Blogs found" });
        return res.status(200).send({ status: true, msg: data });
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};

const deleteBlogByParams = async function (req, res) {
    try {
        let blogId = req.params.blogId;
        let checkBlogId = await blogModel.findById(blogId);
        if (!checkBlogId) {
            return res.status(404).send({ status: false, msg: "Blog doesn't exist" });
        }
        if (checkBlogId.isDeleted == true) {
            return res
                .status(404)
                .send({ status: false, msg: "Blog already deleted" });
        }
        if (checkBlogId.length != 0) {
            let updatedId = await blogModel.updateMany(
                { blogId: blogId, isDeleted: false },
                { $set: { isDeleted: true } },
                { new: true }
            );
            return res.status(200).send({ status: true, msg: updatedId });
        }
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
};

const deleteBlogByQuery = async function (req, res) {
    try {
        let data = req.query;
        let checkDetails = await blogModel.find(data);
        if (checkDetails.length < 1) {
            return res.status(404).send({ status: false, msg: "Blog doesn't exist" });
        }
        let updateDetails = []
        for(i in checkDetails){
            if (checkDetails[i].isDeleted === true) {
                i++;
            }
            await blogModel.updateOne(
                { isDeleted: false },
                { $set: { isDeleted: true , deletedAt: moment().format()} },
                { new: true }
            );
            let details = await blogModel.findById(checkDetails[i]._id);
            updateDetails.push(details)
            
        }
        return res.status(200).send({ status: true, msg: updateDetails });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
};



module.exports = { createBlog, blogsDetails, updateBlog, deleteBlogByParams, deleteBlogByQuery };
