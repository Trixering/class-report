
async function postData(url = '', data = {}) {
    // 規避CORS錯誤
    const proxyURL = "https://cors-anywhere.herokuapp.com/";
    const response = await fetch(proxyURL + url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            "X-Requested-With": "XMLHttpRequest"
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    });
    return response.json();
}



async function reply(debug_ = false) {
    let comment = easyMDE.value();
    let name = document.getElementById('user-name').value;
    const type = "text";
    const short_code = "uw5hgw8w35p2ogi";

    if (!comment || !name) {
        alert("Please enter your name and comment.");
        return;
    } else if (name.length > 40) {
        alert("Your name lenght must less than 40.");
        return;
    }

    try {
        const existingComments = await getComments();
        const newTimestamp = Math.floor(Date.now() / 1000);
        //防止惡意留言
        if (comment.toString().match("script")) {
            comment = "<code>" + comment + "</code>"
        }
        comment = comment.replaceAll("autoplay|loop", "")
        comment = comment.replaceAll("\n", "<br>");
        const newComment = [newTimestamp, name, comment];
        console.log(newComment)
        const updatedComments = [...existingComments, newComment];

        if (debug_ == true) {
            alert("測試"); // 測試
            console.log(comment);
        } else {
            await postData("https://js.al/short_api", {
                "orgi_url": JSON.stringify(updatedComments),
                "short_code": short_code,
                "type": type
            }).then(resp => {
                alert("發表成功！");
                window.location.href = "comment.html";
            }).catch(error => {
                console.error("Error posting comment:", error);
            });
        }
    } catch (error) {
        console.error("Error fetching existing comments:", error);
    }
}
async function getComments(debug_ = false) {
    const proxyURL = "https://cors-anywhere.herokuapp.com/";
    const requestURL = "https://js.al/uw5hgw8w35p2ogi";
    const commentList = document.getElementById('comment-list');
    const replyDiv = document.querySelector('.reply');

    replyDiv.style.display = 'none';

    try {
        let data;

        if (debug_ == true) {

            const response = await fetch('comment.json');

            if (!response.ok) {
                throw new Error('Failed to fetch local comment.json');
            }

            data = await response.json();
        } else {
            const request = new Request(proxyURL + requestURL, {
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            const response = await fetch(request);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            data = await response.json();
        }

        displayComments(data);
        replyDiv.style.display = 'block';
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        commentList.innerHTML = `
            <p style="width: 500px;">
                請先至cors-anywhere開啟設置。<br>
                <a href="https://cors-anywhere.herokuapp.com/" target="_blank">
                    https://cors-anywhere.herokuapp.com/
                </a>
            </p>
        `;
        replyDiv.style.display = 'none';
    }
}

function displayComments(data) {
    const commentList = document.getElementById('comment-list');
    commentList.innerHTML = "";

    data.sort((a, b) => b[0] - a[0]);

    data.forEach(([timestamp, username, comment]) => {
        const date = new Date(timestamp * 1000).toISOString().split('T')[0].replace(/-/g, '/');
        const commentHTML = `
            <div class="comment-bg">
                <div class="user-box">
                    <div class="username">${username}</div>
                    <div class="date">${date}</div>
                </div>
                <div class="cmt-default">${comment}</div>
                <center><span class="more">...</span></center>
            </div>
        `;
        commentList.innerHTML += commentHTML;
    });

    //留言高度限制
    document.querySelectorAll('.comment-bg').forEach(commentBg => {
        const commentContent = commentBg.querySelector('.cmt-default');
        // ...
        const more = commentBg.querySelector('.more');

        if (commentContent.scrollHeight > 280) {
            commentContent.classList.add('cmt-2height');

            //點擊開合
            commentBg.addEventListener('click', () => {
                const isExpanded = commentContent.classList.toggle('expanded');

                if (isExpanded) {
                    commentContent.style.maxHeight = commentContent.scrollHeight + 'px';
                    more.style.opacity = '0';
                } else {
                    commentContent.style.maxHeight = '280px';
                    more.style.opacity = '1';

                    // 收合移動到留言開頭
                    const offsetTop = commentBg.getBoundingClientRect().top + window.scrollY - 60;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });

            commentContent.style.maxHeight = '280px';
        } else {
            more.style.display = 'none';
        }
    });
} window.onload = getComments;
