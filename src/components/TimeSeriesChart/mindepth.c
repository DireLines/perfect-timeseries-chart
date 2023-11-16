int minimum_depth(Node* root) {
    if (root->left == nullptr && root->right == nullptr)
        return 0;
    else if (root->left == nullptr)

        return minimum_depth(root->right) + 1;

    else if (root->right == nullptr)

        return minimum_depth(root->left) + 1;

    else
        return min(minimum_depth(root->left),
                   minimum_depth(root->right)) + 1;
}
