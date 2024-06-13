#main.py

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from flask import Flask, request, jsonify
from flask_cors import CORS
from dados import reviews, labels

app = Flask(__name__)
CORS(app)

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(reviews)
y = labels

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = MultinomialNB(alpha=1, fit_prior=True)
model.fit(X_train, y_train)

@app.route('/')
def homepage():
    return 'A API está online!'

@app.route('/avaliar', methods=['POST'])
def avaliar():
    texto = request.json['texto']
    texto_vectorizado = vectorizer.transform([texto])
    previsao = model.predict(texto_vectorizado)[0]
    return jsonify({'resultado': previsao})

if __name__ == '__main__':
    app.run(debug=True)