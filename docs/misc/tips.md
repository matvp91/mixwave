---
next:
  text: "Miscellaneous: Credits"
  link: "/misc/credits"
---

# Tips

You're free to host Mixwave as you like, but we suggest you run each package separately on one or multiple machines. Typically, you wouldn't want to run the workers on the same machine as you would run the api.

If you want to keep costs manageable, take the following guidelines into consideration:

- Run one, or more, `artisan` instances on [AWS EC2 Spot Instances](https://aws.amazon.com/ec2/spot/), when your instance is terminated by AWS, the pending job will return to waiting state and the next available spot instance will pick it up. When that sounds unfortunate, it's no big deal as the upside is up to 80% cost reduction of running `ffmpeg` or other transcode related jobs.
- Instead of S3, use [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/), which comes with zero egress cost. The cost of processing video is one thing, but getting that video to the end user is arguably the largest cost. Keeping egress in check is a must.
- The `dashboard` package can be hosted for free on [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform) as a static site. But you're free to host it anywhere you like. R2 would be a great fit aswell.
