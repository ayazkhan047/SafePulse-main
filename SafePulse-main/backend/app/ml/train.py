"""
SafePulse Pure NumPy Machine Learning Engine & Evaluation Pipeline
High-performance, portable Decision Tree & Random Forest Classifier.
Computes real Confusion Matrix, Precision, Recall, F1, and Feature Importances
without binary DLL dependencies, ensuring 100% cross-platform compatibility.
"""

import os
import sys
import json
import numpy as np
import pandas as pd

class PureDecisionTreeNode:
    def __init__(self, feature=None, threshold=None, left=None, right=None, value=None, probas=None):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value  # Class prediction
        self.probas = probas  # Class probabilities dict

    def is_leaf(self):
        return self.value is not None

    def to_dict(self):
        if self.is_leaf():
            return {"value": self.value, "probas": self.probas}
        return {
            "feature": int(self.feature),
            "threshold": float(self.threshold),
            "left": self.left.to_dict(),
            "right": self.right.to_dict()
        }

class PureDecisionTreeClassifier:
    def __init__(self, max_depth=6, min_samples_split=5):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.root = None
        self.classes_ = ["LOW", "MODERATE", "HIGH"]
        self.feature_importances_ = None

    def fit(self, X, y):
        self.n_features = X.shape[1]
        self.feature_importances_ = np.zeros(self.n_features)
        self.root = self._grow_tree(X, y)
        total_imp = np.sum(self.feature_importances_)
        if total_imp > 0:
            self.feature_importances_ = self.feature_importances_ / total_imp

    def _grow_tree(self, X, y, depth=0):
        n_samples, n_features = X.shape
        n_labels = len(np.unique(y))

        # Check stopping criteria
        if depth >= self.max_depth or n_labels <= 1 or n_samples < self.min_samples_split:
            leaf_val, probas = self._most_common_label(y)
            return PureDecisionTreeNode(value=leaf_val, probas=probas)

        best_feat, best_thresh, best_gain = self._best_split(X, y, n_features)
        if best_gain <= 0:
            leaf_val, probas = self._most_common_label(y)
            return PureDecisionTreeNode(value=leaf_val, probas=probas)

        self.feature_importances_[best_feat] += best_gain * n_samples

        left_idx = X[:, best_feat] <= best_thresh
        right_idx = ~left_idx

        left = self._grow_tree(X[left_idx], y[left_idx], depth + 1)
        right = self._grow_tree(X[right_idx], y[right_idx], depth + 1)
        return PureDecisionTreeNode(feature=best_feat, threshold=best_thresh, left=left, right=right)

    def _best_split(self, X, y, n_features):
        best_gain = -1
        split_idx, split_thresh = None, None
        parent_impurity = self._gini(y)

        for feat_idx in range(n_features):
            X_column = X[:, feat_idx]
            thresholds = np.unique(X_column)
            if len(thresholds) > 10:
                # Sample percentiles for speed
                thresholds = np.percentile(thresholds, np.linspace(10, 90, 8))

            for thresh in thresholds:
                gain = self._information_gain(y, X_column, thresh, parent_impurity)
                if gain > best_gain:
                    best_gain = gain
                    split_idx = feat_idx
                    split_thresh = thresh

        return split_idx, split_thresh, best_gain

    def _information_gain(self, y, X_column, thresh, parent_impurity):
        left_idx = X_column <= thresh
        right_idx = ~left_idx

        if np.sum(left_idx) == 0 or np.sum(right_idx) == 0:
            return 0

        n = len(y)
        n_l, n_r = np.sum(left_idx), np.sum(right_idx)
        e_l, e_r = self._gini(y[left_idx]), self._gini(y[right_idx])
        child_impurity = (n_l / n) * e_l + (n_r / n) * e_r
        return parent_impurity - child_impurity

    def _gini(self, y):
        _, counts = np.unique(y, return_counts=True)
        probas = counts / len(y)
        return 1.0 - np.sum(probas ** 2)

    def _most_common_label(self, y):
        counts = {cls: 0 for cls in self.classes_}
        for label in y:
            if label in counts:
                counts[label] += 1
        total = len(y) if len(y) > 0 else 1
        probas = {cls: round(counts[cls] / total, 4) for cls in self.classes_}
        most_common = max(counts.items(), key=lambda x: x[1])[0]
        return most_common, probas

    def predict(self, X):
        return np.array([self._traverse_tree(x, self.root) for x in X])

    def predict_proba(self, X):
        return [self._traverse_tree_proba(x, self.root) for x in X]

    def _traverse_tree(self, x, node):
        if node.is_leaf():
            return node.value
        if x[node.feature] <= node.threshold:
            return self._traverse_tree(x, node.left)
        return self._traverse_tree(x, node.right)

    def _traverse_tree_proba(self, x, node):
        if node.is_leaf():
            return node.probas
        if x[node.feature] <= node.threshold:
            return self._traverse_tree_proba(x, node.left)
        return self._traverse_tree_proba(x, node.right)


class PureRandomForestClassifier:
    """Random Forest Ensemble composed of multiple PureDecisionTreeClassifiers"""
    def __init__(self, n_estimators=10, max_depth=6, min_samples_split=5):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.trees = []
        self.classes_ = ["LOW", "MODERATE", "HIGH"]
        self.feature_importances_ = None

    def fit(self, X, y):
        self.trees = []
        n_samples, n_features = X.shape
        self.feature_importances_ = np.zeros(n_features)

        for i in range(self.n_estimators):
            # Bootstrap sample
            boot_idx = np.random.choice(n_samples, size=n_samples, replace=True)
            X_b, y_b = X[boot_idx], y[boot_idx]

            tree = PureDecisionTreeClassifier(
                max_depth=self.max_depth,
                min_samples_split=self.min_samples_split
            )
            tree.fit(X_b, y_b)
            self.trees.append(tree)
            self.feature_importances_ += tree.feature_importances_

        total_imp = np.sum(self.feature_importances_)
        if total_imp > 0:
            self.feature_importances_ = self.feature_importances_ / total_imp

    def predict(self, X):
        tree_preds = np.array([tree.predict(X) for tree in self.trees])
        # Majority voting
        preds = []
        for j in range(X.shape[0]):
            votes = tree_preds[:, j]
            vals, counts = np.unique(votes, return_counts=True)
            preds.append(vals[np.argmax(counts)])
        return np.array(preds)

    def predict_proba(self, X):
        results = []
        for x in X:
            tree_probas = [tree._traverse_tree_proba(x, tree.root) for tree in self.trees]
            avg_probas = {}
            for cls in self.classes_:
                avg_probas[cls] = round(float(np.mean([p[cls] for p in tree_probas])), 4)
            results.append(avg_probas)
        return results


def train_and_evaluate():
    ml_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.dirname(ml_dir)
    backend_dir = os.path.dirname(app_dir)
    root_dir = os.path.dirname(backend_dir)
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

    data_path = os.path.join(root_dir, "data", "synthetic_emergency_dataset.csv")

    if not os.path.exists(data_path):
        from app.services.dataset_generator import generate_emergency_dataset
        df = generate_emergency_dataset(1500)
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        df.to_csv(data_path, index=False)
    else:
        df = pd.read_csv(data_path)

    # Feature processing
    cat_order = ["bleeding", "burns", "choking", "cardiac", "injury"]
    age_order = ["child", "adult", "elderly"]

    for c in cat_order:
        df[f"cat_{c}"] = (df["category"] == c).astype(int)
    for a in age_order:
        df[f"age_{a}"] = (df["age_group"] == a).astype(int)

    feature_cols = [
        "quick_critical",
        "severity_score",
        "extent_affected",
        "duration_mins",
        "breathing_difficulty",
        "consciousness_level",
        "pain_level"
    ] + [f"cat_{c}" for c in cat_order] + [f"age_{a}" for a in age_order]

    X = df[feature_cols].values
    y = df["urgency"].values

    classes = ["LOW", "MODERATE", "HIGH"]

    # Stratified train/test split
    np.random.seed(42)
    indices = np.arange(len(y))
    test_indices = []
    train_indices = []

    for cls in classes:
        cls_idx = indices[y == cls]
        np.random.shuffle(cls_idx)
        n_test = int(len(cls_idx) * 0.25)
        test_indices.extend(cls_idx[:n_test])
        train_indices.extend(cls_idx[n_test:])

    X_train, y_train = X[train_indices], y[train_indices]
    X_test, y_test = X[test_indices], y[test_indices]

    # Fit Random Forest Ensemble
    rf = PureRandomForestClassifier(n_estimators=10, max_depth=6)
    rf.fit(X_train, y_train)

    # Also fit single Decision Tree for offline JSON export
    dt = PureDecisionTreeClassifier(max_depth=6)
    dt.fit(X_train, y_train)

    y_pred = rf.predict(X_test)

    # Calculate metrics
    acc = float(np.mean(y_pred == y_test))

    # Confusion Matrix: rows=actual, cols=predicted
    cm = []
    per_class = {}
    precisions, recalls, f1s = [], [], []

    for actual_cls in classes:
        row = []
        actual_mask = (y_test == actual_cls)
        actual_count = int(np.sum(actual_mask))

        for pred_cls in classes:
            pred_mask = (y_pred == pred_cls)
            count = int(np.sum(actual_mask & pred_mask))
            row.append(count)
        cm.append(row)

        tp = int(np.sum((y_test == actual_cls) & (y_pred == actual_cls)))
        fp = int(np.sum((y_test != actual_cls) & (y_pred == actual_cls)))
        fn = int(np.sum((y_test == actual_cls) & (y_pred != actual_cls)))

        prec = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
        rec = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
        f1 = float(2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0

        precisions.append(prec)
        recalls.append(rec)
        f1s.append(f1)

        per_class[actual_cls] = {
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "support": actual_count
        }

    feature_importances = [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in sorted(zip(feature_cols, rf.feature_importances_), key=lambda x: x[1], reverse=True)
    ]

    metadata = {
        "model_type": "SafePulse Pure-NumPy Random Forest Ensemble (10 Trees, Stratified)",
        "classes": classes,
        "feature_names": feature_cols,
        "sample_size": len(df),
        "test_size": len(y_test),
        "metrics": {
            "accuracy": round(acc, 4),
            "precision_macro": round(float(np.mean(precisions)), 4),
            "recall_macro": round(float(np.mean(recalls)), 4),
            "f1_macro": round(float(np.mean(f1s)), 4),
            "per_class": per_class
        },
        "confusion_matrix": {
            "labels": classes,
            "matrix": cm
        },
        "feature_importances": feature_importances,
        "decision_tree_export": dt.root.to_dict()  # For Phantom Protocol offline edge execution
    }

    meta_path = os.path.join(ml_dir, "model_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"ML Pipeline execution successful! Overall Accuracy: {acc*100:.2f}%")
    print(f"Macro F1-Score: {metadata['metrics']['f1_macro']}")
    print(f"Metadata & offline Decision Tree exported to {meta_path}")
    return metadata, rf

if __name__ == "__main__":
    train_and_evaluate()
