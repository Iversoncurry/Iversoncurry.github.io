function rectCover(number)
{
    // write code here
    var count = 0
    if (number == 0) {
        return 0
    }
    if (number <= 2) {
        return number
    } else {
        count = count + rectCover(number - 1) + rectCover(number - 2)
        return count
    }
}

function reOrderArray(array)
{
    // write code here
    var resultArray = []
    var resultS = []
    var resultR = []
    array.forEach(item => {
        if (item%2 !== 0) {
            resultS.push(item)
        } else {
            resultR.push(item)
        }
    })
    // resultArray = resultS.concat(resultR)
    resultArray = resultS + resultR
    return resultArray
}


function FindKthToTail(head, k)
{
    // write code here
    let root = head
    let num = 0
    let fs
    while(root.next !== null) {
        num = num + 1
        root = root.next
    }
    if (k > num) {
        return null
    } else {
        fs = num - k
        while (fs > 0) {
            head = head.next
            fs = fs - 1
        }
    }
    return head
}

function FindKthToTail(head, k)
{
    // write code here
     
    if(head == null || k <= 0) return false;;
     
    var p1 = head;
    var p2 = head;
     
    for (var i = 1; i < k; i++) {
        if (p1.next != null) {
            p1 = p1.next;
        }
        else {
            return false;
        }
    }
     
    while (p1.next != null) {
        p1 = p1.next;
        p2 = p2.next;
    }
    return p2;
}

function ReverseList(pHead)
{
    // write code here
    let p = pHead
    let newPHead
    if (pHead == null) {
        return null
    }
    while (p.next !== null) {
        p.next.pre = p 
        p = p.next
    }
    newPHead = p
    while (p.pre) {
        p.next = p.pre
    }
    p.next = null
    return newPHead
    
}

function Node(val, node) {
    this.val = val
    this.next = node
}
var d = new Node('d', null)
var c = new Node('c', d)
var b = new Node('b', c)
var a = new Node('a', b)
console.log(ReverseList(a))