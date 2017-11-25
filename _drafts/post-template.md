---
layout:     post
title:      "Blog Post Template"
subtitle:   "Template"
date:       2017-11-25 12:00:00
author:     "Joseph Martinsen"
header-img: "img/post-bg-01.jpg"
categories: [ Template ]
excerpt_separator: <!--more-->
---
<p>This is the template blog post</p>
<!--more-->
<!-- How to do image -->
<h2 class="section-heading">Images</h2>
<a href="#">
    <img src="{{ site.baseurl }}/img/post-sample-image.jpg" class="img-responsive" alt="Post Sample Image">
</a> 
<span class="caption text-muted">Space is Awesome</span>

<h2 class="section-heading">Blocks of Code</h2>
{% highlight python %}
def hello_world():
    print("Hello World!")
{% endhighlight %}
{% highlight python linenos %}
def hello_world():
    print("Hello World!")
{% endhighlight %}

<h2 class="section-heading">Math</h2>
$$ x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$